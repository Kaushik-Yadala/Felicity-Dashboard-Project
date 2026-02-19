const organizer = require('../../models/organizer');

module.exports.removeOrganizer = async (req, res) => {

    try {
        
        const { id } = req.body;

        const update = { valid: false };

        const removedOrganizer = await organizer.findByIdAndUpdate(id, update, { new: true });

        if (!removedOrganizer) {
            return res.status(404).json({ success: false, message: 'Organizer not found' });
        }

        return res.json({ success: true, message: 'Organizer removed successfully', removedOrganizer });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}