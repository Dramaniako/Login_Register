import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log("Received Authorization Header:", authHeader); // <-- Add this log

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        console.log("Extracted Token:", token); // <-- Add this log

        // Check if the token is null, undefined, or an empty string
        if (!token || token === 'undefined') { // Simpler check: !token covers null, undefined, ""
            console.log("Token is null, undefined, or empty after split.");
            return res.sendStatus(401);
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                console.error("JWT Verification Error:", err.name, err.message);
                return res.sendStatus(403); // Forbidden (token invalid, expired, etc.)
            }
            req.email = decoded.email;
            next();
        });
    } else {
        console.log("Authorization header missing, not Bearer type, or malformed.");
        return res.sendStatus(401); // Unauthorized
    }
}