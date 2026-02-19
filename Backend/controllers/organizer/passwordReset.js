const reset = require("../../models/reset");
const organizer = require("../../models/organizer");

module.exports.passwordReset = async (req, res) => {

    try {

        const { id } = req.user;
        const { reason } = req.body;

        const organizerData = await organizer.findById(id);

        if (!organizerData) {
            return res.status(404).json({ success: false, message: 'Organizer not found' });
        }

        const newRequest = new reset({
            organizer: id,
            reason
        })

        await newRequest.save();

        const priorRequests = await reset.find({ organizer: id }).sort({ createdAt: -1 });

        return res.status(201).json({ success: true, message: 'Password reset request submitted successfully', priorRequests });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }

}