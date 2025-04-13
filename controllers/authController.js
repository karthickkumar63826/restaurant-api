const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existing = await User.findByEmail(email);

        if (existing) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await User.create(name, email, hashedPassword, role);

        res.status(201).json({ userId, message: "Registered successfully" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const login = async (req, res) => {

    const { email, password } = req.body;

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });

        res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

module.exports = { register, login };