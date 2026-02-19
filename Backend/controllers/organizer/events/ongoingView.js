const event = require('../../../models/event');

module.exports.ongoingView = async (req, res) => {

    try {

        const {id, role} = req.user;

        const events = await event.find({organizer: id, status: 'Ongoing'});

        return res.json({ success: true, events });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }

}