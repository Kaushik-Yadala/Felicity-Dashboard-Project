const qrcode = require('qrcode');

const generateQR = async (text) => {

    try{
        const url = await qrcode.toDataURL(text);
        return url;
    } catch (err) {
        console.error(err);
        throw new Error('Failed to generate QR code');
    }
}

module.exports = { generateQR };
