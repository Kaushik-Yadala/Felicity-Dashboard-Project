const nodeMailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const sendRegEmail = async (email, event_name, eventStart, eventEnd, ticket_id, qrcode) => {

    try {
        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Registration Confirmation for ${event_name}`,
        attachments: [
            {
                filename: 'qrcode.png',
                path: qrcode,
                cid: 'unique-qr'
            }
        ],
        html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #ffffff;">
        
        <h2 style="color: #4CAF50; text-align: center; margin-bottom: 20px;">
            Congratulations! You have been registered for ${event_name}
        </h2>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center;">
            
            <p style="font-size: 18px; margin: 10px 0; color: #333;">
                <strong>Your Ticket ID is:</strong> <span style="font-family: monospace; background: #eee; padding: 5px 10px; border-radius: 4px;">${ticket_id}</span>
            </p>

            <p style="font-size: 16px; margin-top: 20px; margin-bottom: 10px; font-weight: bold;">Your QR Code:</p>
            
            <div style="margin: 10px auto;">
                <img src="cid:unique-qr" alt="Event QR Code" style="width: 200px; height: 200px; border: 2px solid #ddd; padding: 10px; background: white; border-radius: 5px;" />
            </div>

            <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
                <p style="font-size: 16px; color: #555;">
                    <strong>Event Timings:</strong><br/>
                    ${eventStart} - ${eventEnd}
                </p>
            </div>
        </div>

        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
            Please show this QR code at the venue entrance.
        </p>
    </div>
`
    };

    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending registration email:', error);
            throw new Error('Failed to send registration email');
        } else {
            console.log('Registration email sent: ' + info.response);
        }
    });
    } catch (error) {
        console.error('Error creating transporter:', error);
        throw new Error('Failed to create email transporter');
    }
}

module.exports = { sendRegEmail };