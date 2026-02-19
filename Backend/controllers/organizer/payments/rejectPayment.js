const registration = require('../../../models/registration');
const event = require('../../../models/event');

module.exports.rejectPayment = async (req, res) => {
    try {
        const { registrationId } = req.params;
        const { id } = req.user;

        const reg = await registration.findById(registrationId)
            .populate('event');

        if (!reg) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        if (reg.event.organizer.toString() !== id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        if (reg.payment !== 'Pending' || reg.registrationStatus !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Registration is not pending' });
        }

        reg.payment = 'Failed';
        reg.registrationStatus = 'Cancelled';
        await reg.save();

        return res.json({ success: true, message: 'Payment rejected successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
