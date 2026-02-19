const event = require('../../../models/event');

module.exports.createDraft = async (req, res) => {

    try {

        const {id, role} = req.user;
        const {name, desc} = req.body;

        const newEvent = new event({
            name,
            desc,
            organizer: id,
            status: 'Draft'
        });

        await newEvent.save();

        if(newEvent) {
                return res.json({ success: true, eventId: newEvent._id });
        } else {
            return res.status(400).json({ success: false, message: 'Failed to create event draft' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }

}

