import { clerkClient } from "@clerk/express";
import { sql } from "../config/db.js";

const isNotFoundError = (error) => (
    error !== null
    && typeof error === "object"
    && "status" in error
    && error.status === 404
);

export const ensureUserExists = async (userId) => {
    const users = await sql`SELECT id FROM users WHERE id = ${userId}`;
    if (users.length > 0) {
        return;
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
        throw new Error(`Clerk user ${userId} does not have a primary email address`);
    }

    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ")
        || clerkUser.username
        || primaryEmail;

    await sql`
        INSERT INTO users (id, name, email, image, plan)
        VALUES (${userId}, ${name}, ${primaryEmail}, ${clerkUser.imageUrl}, 'free')
        ON CONFLICT (id) DO NOTHING
    `;
};

export const syncUserPlan = async (userId) => {
    let isPremium = false;
    try {
        const subscription = await clerkClient.billing.getUserBillingSubscription(userId);
        isPremium = subscription.status === "active"
            && subscription.subscriptionItems.some(
                (item) => item.status === "active" && item.plan?.slug === "premium"
            );
    } catch (error) {
        if (!isNotFoundError(error)) {
            throw error;
        }
    }

    const plan = isPremium ? "premium" : "free";

    await sql`UPDATE users SET plan = ${plan}, updated_at = NOW() WHERE id = ${userId}`;
    return plan;
};
