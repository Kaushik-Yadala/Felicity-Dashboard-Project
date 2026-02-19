const organizer = require('../../models/organizer');

module.exports.profilePost = async (req, res) => {
    try {

        const { id } = req.user;

        const updates = {};

        if(req.body.name) {
            updates.name = req.body.name;
        }

        if(req.body.category){
            updates.category = req.body.category;
        }

        if(req.body.contact){
            updates.contact = req.body.contact;
        }

        if (req.body.discord) {
            updates.discord = req.body.discord;
        }

        const user = await organizer.findByIdAndUpdate(id, updates, { new: true }).select('-password');

        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }

        return res.json({success: true, message: 'Edit completed successfully', user});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
