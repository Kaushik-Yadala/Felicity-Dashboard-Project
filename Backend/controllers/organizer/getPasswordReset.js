const reset = require("../../models/reset");
const organizer = require("../../models/organizer");

module.exports.getPasswordReset = async (req, res) => {

    try {

        const { id, role } = req.user;

        const organizerData = await organizer.findById(id);

        if (!organizerData) {
            return res.status(404).json({ success: false, message: 'Organizer not found' });
        }

        const request = await reset.findOne({ organizer: id, status: 'Pending' });
        const priorRequest = await reset.find({ organizer: id, status: { $in: ['Approved', 'Rejected'] } });
        
        if (request) {
            return res.status(200).json({ exists: true, message: request, priorRequest: priorRequest });
        }else{
            return res.status(200).json({ exists: false, message: 'No pending password reset request found', priorRequest: priorRequest });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }

}