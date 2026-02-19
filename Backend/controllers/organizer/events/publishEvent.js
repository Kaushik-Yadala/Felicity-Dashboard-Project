const Event = require('../../../models/event');

module.exports.publishEvent = async (req, res) => {
    try {
        const { id } = req.user;
        const { eventId } = req.params;
        
        const eventData = await Event.findById(eventId);

        if (!eventData) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (eventData.organizer.toString() !== id) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to event data' });
        }

        eventData.status = 'Published';

        await eventData.save();

        return res.json({ success: true, message: 'Event published successfully', eventData });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}