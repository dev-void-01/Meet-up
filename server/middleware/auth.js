import { getAuth } from "@clerk/express"
import { ensureUserExists } from "../services/userService.js"

export const protect = async (req, res, next) =>{
    try {
        const auth = getAuth(req);
        const userId = auth?.userId || req.auth?.userId;

        if(!userId){
            return res.status(401).json({ error: "Not authorized, authentication required" });
        }

        req.user = {id: userId};
        await ensureUserExists(userId);

        next();
    } catch (error) {
        next(error);
    }
}