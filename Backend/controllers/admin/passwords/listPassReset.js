const reset = require('../../../models/reset');
const bcrypt = require('bcrypt');
const organizer = require('../../../models/organizer');

module.exports.listPassReset = async (req, res) => {

    try{

        const requests = await reset.find().populate('organizer');

        if (!requests){
            return res.status(404).json({ success: false, message: 'No requests were found'});
        }

        return res.status(200).json({success: true, requests });


    } catch (error) {
        return res.status(500).json({success: false, message: error});
    }

}