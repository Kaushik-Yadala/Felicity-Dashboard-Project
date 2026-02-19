const participant = require('../../models/participant');

module.exports.onboardPost = async (req, res) => {

    try {
        
        const { id, role} = req.user;

        const updates = {};
        
        if(req.body.interests) {
            updates.interests = req.body.interests;
        }

        if(req.body.following) {
            updates.following = req.body.following;
        }

        const user = await participant.findByIdAndUpdate(id, updates, { new: true });

        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }

        return res.json({success: true, message: 'Onboarding completed successfully', user});

    } catch(error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }

}