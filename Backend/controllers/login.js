const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const participant = require('../models/participant');
const organizer = require('../models/organizer');
const admin = require('../models/admin');
const express = require('express');
const app = express();
app.use(express.json());

exports.login = async (req, res) => {

    try {
        const { email, password, role, captchaValue } = req.body;

        const secretKey = process.env.SECRET_KEY;
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;

        const formData = new URLSearchParams();
        formData.append('secret', secretKey);
        formData.append('response', captchaValue);

        const googleResponse = await fetch(verifyUrl, {
            method: 'POST',
            body: formData,
        });

        const googleData = await googleResponse.json();

        if (!googleData.success) {
            return res.status(400).json({
                success: false,
                message: googleData['error-codes']
            });
        }

        if (role === 'participant') {
            const user = await participant.findOne({ email });

            if (!user) {
                return res.status(400).json({ success: false, message: 'Invalid email or username' });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Invalid password' });
            }

            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, (err, token) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'Error generating token' });
                }
                return res.json({ success: true, token });
            });
        } else if (role === 'organizer') {
            const user = await organizer.findOne({ email });

            if (!user) {
                return res.status(400).json({ success: false, message: 'Invalid email or username' });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Invalid password' });
            }

            if (!user.valid) {
                return res.status(403).json({ success: false, message: 'Your account has been suspended HAHAHA' });
            }

            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, (err, token) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'Error generating token' });
                }
                return res.json({ success: true, token });
            });
        } else if (role === 'admin') {
            const user = await admin.findOne({ username: email });

            if (!user) {
                return res.status(400).json({ success: false, message: 'Invalid email or username or role' });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Invalid password' });
            }

            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, (err, token) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'Error generating token' });
                }
                return res.json({ success: true, token });
            });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }

}
