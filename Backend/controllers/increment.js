const event = require('../models/event');

module.exports.increment = async (req, res) => {
    try {
        const eventId = req.params.eventId;

        const eventData = await event.findById(eventId);

        if (!eventData) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        eventData.visits += 1;
        await eventData.save();

        return res.status(200).json({ success: true, message: 'Visit count incremented' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}