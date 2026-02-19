const registration = require('../../../models/registration');
const event = require('../../../models/event');
const participant = require('../../../models/participant');

module.exports.getPendingPayments = async (req, res) => {
    try {
        const { id } = req.user;

        const organizerEvents = await event.find({ organizer: id });
        const eventIds = organizerEvents.map(e => e._id);

        const pendingRegistrations = await registration.find({
            event: { $in: eventIds },
            payment: 'Pending',
            registrationStatus: 'Pending',
            'merchandise.paymentProof': { $ne: '' }
        })
        .populate('event', 'name price eventType')
        .populate('participant', 'name email participantType');

        const formattedData = pendingRegistrations.map(reg => ({
            registrationId: reg._id,
            ticketID: reg.ticketID,
            eventName: reg.event.name,
            eventPrice: reg.event.price,
            eventType: reg.event.eventType,
            participantName: reg.participant.name,
            participantEmail: reg.participant.email,
            participantType: reg.participant.participantType,
            amount: reg.merchandise?.amount || 1,
            totalPrice: (reg.merchandise?.amount || 1) * reg.event.price,
            paymentProof: reg.merchandise?.paymentProof || '',
            createdAt: reg.createdAt
        }));

        return res.json({ success: true, payments: formattedData });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
