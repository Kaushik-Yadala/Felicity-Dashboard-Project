const organizer = require('../../models/organizer');

module.exports.onboardGet = async (req, res) => {

    try {

        const organizations = await organizer.find({}).select('name _id category');

        return res.json({
            success: true,
            count: organizations.length,
            data: organizations
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}