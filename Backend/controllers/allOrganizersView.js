const organizer = require('../models/organizer');
const participant = require('../models/participant');

module.exports.allOrganizersView = async (req, res) => {
    try {
        const organizers = await organizer.find({}, 'name category desc valid');
        const participantData = await participant.findById(req.user.id);
        if (!participantData) {
            return res.status(404).json({ success: false, message: 'Participant not found' });
        }
        let followedOrganizers = [];
        if (participantData.following){
            followedOrganizers = participantData.following.map(id => id.toString());
        }
        let validOrganizers = organizers.filter(org => org.valid === true);
        results = validOrganizers.map(org => {
            return {
                _id: org._id,
                name: org.name,
                category: org.category,
                desc: org.desc,
                following: followedOrganizers.includes(org._id.toString())
            }
        })
        return res.json({ success: true, organizers: results });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}