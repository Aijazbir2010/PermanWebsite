import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET; // Secret for Access Token

// Protected Route Middleware
export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({message: "Unauthorized !"})
    }

    try {
        const verified = jwt.verify(token, JWT_ACCESS_SECRET);
        req.user = verified;
        next()
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired!" });
        }
        res.status(403).json({message: "Invalid or Expired Token !"})
    }

}