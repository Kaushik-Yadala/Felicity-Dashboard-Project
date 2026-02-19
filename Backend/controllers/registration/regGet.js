const registration = require("../../models/registration");
const event = require("../../models/event");
const participant = require("../../models/participant");

module.exports.regGet = async (req, res) => {

    try {

        const user = req.user;
        const eventId = req.params.eventId;
        const participantData = await participant.findById(user.id);

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

        const existingReg = await registration.findOne({ participant: user.id, event: eventId });

        if (existingReg) {
            return res.status(403).json({ message: 'You have already registered for this event' });
        }

        if (eventData.eventType === 'Merchandise'){

            const returnData = {
                name: eventData.name,
                price: eventData.price,
                variants: eventData.variants,
                stockQuantity: eventData.stockQuantity,
                purchaseLimit: eventData.purchaseLimit,
                form: eventData.customForm
            }

            return res.json({ success: true, event: returnData });

        }else{
            const returnData = {
                name: eventData.name,
                price: eventData.price,
                form: eventData.customForm
            }

            return res.json({ success: true, event: returnData });
        }
    }   catch (error) { 
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}