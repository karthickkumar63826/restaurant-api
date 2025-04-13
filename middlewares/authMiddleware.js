const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};


const checkRole = (role) => {
    return (req, res, next) => {
        if (req.user?.role !== role) {
            return res.status(401).json({ message: "Access Denied" });
        }
        next();
    };
};

module.exports = { verifyToken, checkRole };