import express from 'express';
import User from '../models/user.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = express.Router();

//register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, cohort } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const user = new User({ name, email, password, role, cohort });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        res.status(400).json({ error: 'Server error' });
    }
});

//login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        console.log('Stored hashed password:', user.password); // debug hash guardado

        const isMatch = await user.comparePassword(password);
        console.log('Password match result:', isMatch); // debug resultado comparación
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({
            id: user._id, role: user.role, cohort: user.cohort
        },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//olvidar contraseña
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const token = crypto.randomBytes(32).toString('hex');

        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 horita
        await user.save();

        res.json({
            message: 'Password reset token generated',
            token: token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});


// resetear contraseña
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        res.json({
            message: 'Password reset successful'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;