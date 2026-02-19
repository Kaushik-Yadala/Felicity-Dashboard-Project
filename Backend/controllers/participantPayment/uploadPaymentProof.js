const cloudinary = require('../../config/cloudinary');
const Registration = require('../../models/registration');

const uploadPaymentProof = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.files || !req.files.paymentProof) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const registration = await Registration.findById(id);
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        if (registration.participant.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }

        const file = req.files.paymentProof;

        if (!file.mimetype.startsWith('image/')) {
            return res.status(400).json({
                success: false,
                message: 'Only image files are allowed'
            });
        }

        if (file.size > 5 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: 'File size must be less than 5MB'
            });
        }

        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: process.env.CLOUDINARY_FOLDER || 'payments',
            resource_type: 'auto'
        });

        registration.merchandise.paymentProof = result.secure_url;
        await registration.save();

        return res.status(200).json({
            success: true,
            message: 'Payment proof uploaded successfully',
            data: {
                paymentProofUrl: result.secure_url
            }
        });

    } catch (error) {
        console.error('Upload payment proof error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to upload payment proof',
            error: error.message
        });
    }
};

module.exports = { uploadPaymentProof };
