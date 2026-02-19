module.exports.getRole = async (req, res) => {

    try {
        const {id, role} = req.user;

        return res.status(200).json({ success: true, role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }

}