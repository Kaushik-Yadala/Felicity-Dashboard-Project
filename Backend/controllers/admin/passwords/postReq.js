const reset = require('../../../models/reset');
const organizer = require('../../../models/organizer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');


module.exports.postReq = async (req, res) => {

    try{

        const { id, status, comments} = req.body;

        const request = await reset.findById(id);
        const organizerData = await organizer.findById(request.organizer);

        if (!request){
            return res.status(404).json({ success: false, message: 'Request was not found'});
        }

        request.status = status;
        request.comments = comments;

        let newPassword = "";

        if (request.status === 'Approved') {
            newPassword = crypto.randomBytes(4).toString('hex'); 
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            organizerData.password = hashedPassword;
            await organizerData.save();
        }

        const response = await request.save();

        if (!response){
            return res.status(500).json({ success: false, message: 'Failed to update the request'});
        }

        return res.status(200).json({success: true, message: 'Request updated successfully', newPassword: newPassword});

    } catch (error) {
        return res.status(500).json({success: false, message: error});
    }

}