const event = require('../../../models/event');

module.exports.editEventGet = async (req, res) => {
    
    try {

        const {id, role} = req.user;
        const {eventId} = req.params;

        const eventData = await event.findOne({_id: eventId});

        if(!eventData) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if(eventData.organizer.toString() !== id) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to event data' });
        }

        return res.json({ success: true, eventData });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }

}