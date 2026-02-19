const registration = require("../../models/registration")

module.exports.detailReg = async (req, res) => {

    try {

        const regId = req.params.regId;

        const registrations = await registration.findById(regId).populate('event');

        return res.json({ success: true, registration: registrations });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}