
const organizer = require('../../models/organizer');

module.exports.enableOrganizer = async (req, res) => {

    try {
        
        const { id } = req.body;

        const update = { valid: true };

        const removedOrganizer = await organizer.findByIdAndUpdate(id, update, { new: true });

        if (!removedOrganizer) {
            return res.status(404).json({ success: false, message: 'Organizer not found' });
        }

        return res.json({ success: true, message: 'Organizer enabled successfully', removedOrganizer });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}