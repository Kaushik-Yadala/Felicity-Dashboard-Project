const registration = require("../../models/registration")

module.exports.showRegs = async (req, res) => {

    try {

        const participantId = req.user.id;

        const registrations = await registration.find({ participant: participantId }).populate('event');

        return res.json({ success: true, registrations });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}