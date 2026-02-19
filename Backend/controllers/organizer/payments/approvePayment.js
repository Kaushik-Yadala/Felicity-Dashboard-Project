const registration = require('../../../models/registration');
const event = require('../../../models/event');
const participant = require('../../../models/participant');
const { generateQR } = require('../../registration/generateQR');
const { sendRegEmail } = require('../../registration/sendRegEmail');

module.exports.approvePayment = async (req, res) => {
    try {
        const { registrationId } = req.params;
        const { id } = req.user;

        const reg = await registration.findById(registrationId)
            .populate('event')
            .populate('participant');

        if (!reg) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        if (reg.event.organizer.toString() !== id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        if (reg.payment !== 'Pending' || reg.registrationStatus !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Registration is not pending' });
        }

        const eventData = reg.event;
        const merchandiseAmount = reg.merchandise?.amount || 1;

        if (eventData.stockQuantity < merchandiseAmount) {
            return res.status(400).json({ success: false, message: 'Not enough stock available' });
        }

        eventData.stockQuantity -= merchandiseAmount;
        await eventData.save();

        reg.payment = 'Completed';
        reg.registrationStatus = 'Registered';
        await reg.save();

        const qrCodeUrl = await generateQR(reg.ticketID);
        await sendRegEmail(
            reg.participant.email,
            eventData.name,
            eventData.eventStartDate,
            eventData.eventEndDate,
            reg.ticketID,
            qrCodeUrl
        );

        return res.json({ success: true, message: 'Payment approved successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
