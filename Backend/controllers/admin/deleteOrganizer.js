const organizer = require('../../models/organizer');

module.exports.deleteOrganizer = async (req, res) => {

    try {
        
        const { id } = req.body;

        const update = { valid: false };

        const deletedOrganizer = await organizer.findByIdAndDelete(id);

        if (!deletedOrganizer) {
            return res.status(404).json({ success: false, message: 'Organizer not found' });
        }

        return res.json({ success: true, message: 'Organizer deleted successfully', deletedOrganizer });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}