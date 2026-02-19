const bcrypt = require('bcrypt');
const organizer = require('../../models/organizer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

module.exports.addOrganizer = async (req, res) => {

    try {

        const {name, desc, category} = req.body;

        const password = crypto.randomBytes(4).toString('hex'); 
        const email = `${name.toLowerCase().replace(/\s/g, '')}${crypto.randomInt(10, 99)}@felicity.iiit.ac.in`;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newOrganizer = new organizer({
            name,
            email,
            password: hashedPassword,
            desc,
            category,
        });

        await newOrganizer.save();

        if(newOrganizer) {
                return res.json({ success: true, email: email, password: password});
        } else {
            res.status(400).json({ success: false, message: 'Failed to register organizer' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }

}