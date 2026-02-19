const registration = require("../../models/registration")

module.exports.cancelReg = async (req, res) => {

    try {

        const participantId = req.user.id;
        const regId = req.params.regId;

        const registrations = await registration.findById(regId);

        registrations.registrationStatus = "Cancelled";

        await registrations.save();

        return res.json({ success: true, registrations });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}