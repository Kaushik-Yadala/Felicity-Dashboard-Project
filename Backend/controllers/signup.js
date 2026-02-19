const bcrypt = require('bcrypt');
const participant = require('../models/participant');
const jwt = require('jsonwebtoken');

module.exports.signup = async (req, res) => {

    try {

        const { fName, lName, email, password, participantType, organization, contact, captchaValue} = req.body;

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

        const participanteExists = await participant.findOne({ email });

        if (participanteExists) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newParticipant = new participant({
            fName,
            lName,
            email,
            password: hashedPassword,
            participantType,
            organization,
            contact,
        });

        await newParticipant.save();

        if(newParticipant) {
            const token = jwt.sign ({id: newParticipant._id, role: newParticipant.role}, process.env.JWT_SECRET, (err, token) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'Error generating token' });
                }
                return res.json({ success: true, token });
            });
        } else {
            res.status(400).json({ success: false, message: 'Failed to register participant' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }

}