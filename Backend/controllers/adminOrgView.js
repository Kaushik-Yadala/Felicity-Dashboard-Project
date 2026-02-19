const organizer = require('../models/organizer');

module.exports.adminOrgView = async (req, res) => {
    try {
        const organizers = await organizer.find({}, 'name category desc valid');
        return res.json({ success: true, organizers: organizers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}