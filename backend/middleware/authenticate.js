import jwt from 'jsonwebtoken';

const JWT_ACCESS_SECRET = 'perman-website-access-93c572'; // Secret for Access Token

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