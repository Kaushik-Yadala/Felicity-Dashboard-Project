const registration = require("../../models/registration");
const event = require("../../models/event");
const participant = require("../../models/participant");
const {generateQR} = require("./generateQR");
const {sendRegEmail} = require("./sendRegEmail");

module.exports.regPost = async (req, res) => {

    try {
        const user = req.user;
        const eventId = req.params.eventId;
        const participantData = await participant.findById(user.id);
        let formRes;
        if(req.body){
            formRes = req.body.formRes;
        }

        const eventData = await event.findById(eventId);

        if (!eventData) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (eventData.status !== 'Published') {
            return res.status(403).json({ message: 'Event is not accepting registration' });
        }

        if (eventData.registrationDeadline && new Date() > eventData.registrationDeadline) {
            return res.status(403).json({ message: 'Registration deadline has passed' });
        }

        if (eventData.registrationLimit && eventData.registrationLimit <= eventData.registrationList.length) {
            return res.status(403).json({ message: 'Registration limit reached' });
        }

        if (eventData.eligibility && (eventData.eligibility!=="Both" &&eventData.eligibility !== participantData.participantType)) {
            return res.status(403).json({ message: 'You are not eligible to register for this event' });
        }

        const regData = {};

        regData.participant = user.id;
        regData.event = eventId;
        regData.ticketID = `FELICITY-${eventData._id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        if(req.body && req.body.formRes){
            regData.formResponses = formRes.map((res) => ({
                questionLabel: res.questionLabel,
                answer: res.answer
            }));
        }

        if (eventData.eventType === 'Merchandise') {
            const { amount } = (req.body && req.body.amount) ? req.body : { amount: 1 };

            if (amount && (isNaN(amount) || amount < 1 || amount > eventData.purchaseLimit)) {
                return res.status(400).json({ success: false, message: 'Invalid amount' });
            }

            if(amount && eventData.stockQuantity < amount){
                return res.status(403).json({ success: false, message: 'Not enough stock available' });
            }

            // eventData.stockQuantity -= (amount || 1);
            // await eventData.save();

            regData.merchandise = { amount: amount || 1 };
            regData.registrationStatus = 'Pending';
            regData.payment = 'Pending';
        }

        const existingReg = await registration.findOne({ participant: user.id, event: eventId });

        if (existingReg) {
            return res.status(403).json({ message: 'You have already registered for this event' });
        }

        const newRegistration = new registration(regData);
        await newRegistration.save();

        eventData.registrationList.push(newRegistration._id);
        await eventData.save();

        if(eventData.eventType === 'Normal'){
            const qrCodeUrl = await generateQR(newRegistration.ticketID);
            sendRegEmail(participantData.email, eventData.name, eventData.eventStartDate, eventData.eventEndDate, newRegistration.ticketID, qrCodeUrl);
        }


        return res.json({ 
            success: true, 
            message: 'Registration successful', 
            ticketID: newRegistration.ticketID,
            registrationId: newRegistration._id 
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}