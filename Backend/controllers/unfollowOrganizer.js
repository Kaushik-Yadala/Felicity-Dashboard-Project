const organizer = require('../models/organizer');
const participant = require('../models/participant');

module.exports.unfollowOrganizer = async (req, res) => {
    try {
        const user = req.user;
        const organizerId = req.params.organizerId;

        const org = await organizer.findById(organizerId);
        if (!org) {
            return res.status(404).json({ success: false, message: 'Organizer not found' });
        }

        if (!org.followers.includes(user.id)) {
            return res.status(400).json({ success: false, message: 'Not following this organizer' });
        }

        org.followers = org.followers.filter(followerId => followerId.toString() !== user.id);
        await org.save();
        const participantUser = await participant.findById(user.id);
        participantUser.following = participantUser.following.filter(orgId => orgId.toString() !== organizerId);
        await participantUser.save();

        return res.json({ success: true, message: 'Successfully unfollowed the organizer' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}