const organizer = require('../../models/organizer');

module.exports.viewOrganizer = async (req, res) => {

    try {
        
        const organizers = await organizer.find({}).select('name email desc discord valid _id');
        return res.json({
            success: true,
            count: organizers.length,
            data: organizers
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}