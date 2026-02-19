const participant = require('../../models/participant');
const organizer = require('../../models/organizer');

module.exports.getProfile = async (req, res) => {

    try {

        const { id, role } = req.user;

        const user = await participant.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({success: false, message: "User not found"});
        }

        const result = {
            fName: user.fName,
            lName: user.lName,
            email: user.email,
            participantType: user.participantType,
            contact: user.contact,
            organization: user.organization,
            interests: user.interests,
            following: await organizer.find({ _id: { $in: user.following } }, 'name category desc valid')
        }

        return res.json({success: true, user: result});

    } catch (error) {

        return res.status(500).json({success:false, message: error.message});

    }

}