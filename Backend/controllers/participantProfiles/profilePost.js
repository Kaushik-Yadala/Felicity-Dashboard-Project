const participant = require('../../models/participant');

module.exports.profilePost = async (req, res) => {

    try {
        
        const { id, role} = req.user;

        const updates = {};

        if(req.body.fName) {
            updates.fName = req.body.fName;
        }

        if(req.body.lName) {
            updates.lName = req.body.lName;
        }

        if(req.body.email) {
            updates.email = req.body.email;
        }

        if(req.body.contact) {
            updates.contact = req.body.contact;
        }

        if(req.body.interests) {
            updates.interests = req.body.interests;
        }

        if(req.body.following) {
            updates.following = req.body.following;
        }

        if(req.body.organization){
            updates.organization = req.body.organization;
        }

        const user = await participant.findByIdAndUpdate(id, updates, { new: true });

        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }

        return res.json({success: true, message: 'Edit completed successfully', user});

    } catch(error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }

}