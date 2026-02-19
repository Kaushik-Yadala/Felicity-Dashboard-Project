const organizer = require('../models/organizer');
const event = require('../models/event');

module.exports.organizerDetail = async (req, res) => {
    try {
        const user = req.user;
        const organizerId = req.params.organizerId;

        const org = await organizer.findById(organizerId);
        if (!org) {
            return res.status(404).json({ success: false, message: 'Organizer not found' });
        }

        const returnData = {};

        returnData.organizer = org;

        const events = await event.find({ organizer: organizerId });
        const filteredEvents = events.filter(event => event.status !== 'Draft');

        returnData.events = filteredEvents;

        return res.json({ success: true, data: returnData });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
