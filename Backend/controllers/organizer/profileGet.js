const organizer = require('../../models/organizer');

module.exports.profileGet = async (req, res) => {

    try {

        const {id, role} = req.user;

        const organizerData = await organizer.findById(id).select('-password');

        if(!organizerData) {
            return res.status(404).json({ success: false, message: 'Organizer not found' });
        }

        return res.json({ success: true, organizerData });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }

}