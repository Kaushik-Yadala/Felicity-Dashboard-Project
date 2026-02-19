const registration = require('../../../models/registration');

module.exports.scanTicket = async (req, res) => {

    try {

        const eventId = req.params.eventId;
        const { ticketId } = req.body;

        const reg = await registration.findOne({ event: eventId, ticketID: ticketId });

        if (!reg) {
            return res.status(404).json({ success: false, message: 'Wrong Event' });
        }

        if (reg.registrationStatus === 'Attended') {
            return res.status(400).json({ success: false, message: 'Ticket has already been admitted' });
        }

        if (reg.registrationStatus === 'Cancelled') {
            return res.status(400).json({ success: false, message: 'Ticket has been cancelled' });
        }

        reg.registrationStatus = 'Attended';
        reg.attendanceDate = new Date();
        await reg.save();

        return res.status(200).json({ success: true, message: 'Participant admitted successfully ' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

