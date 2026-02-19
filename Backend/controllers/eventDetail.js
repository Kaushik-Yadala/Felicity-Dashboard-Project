const event = require('../models/event');
const organizer = require('../models/organizer');
const registration = require('../models/registration');
const participant = require('../models/participant');

module.exports.eventDetail = async (req, res) => {

    const {id, role} = req.user;
    const {eventId} = req.params;

    try {
        const eventData = await event.findOne({_id: eventId});
        const participantData = await participant.findById(id);

        if(!eventData) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        returnData = {};
        returnData.name = eventData.name;
        returnData.desc = eventData.desc;
        returnData.eventType = eventData.eventType;
        returnData.eligibility = eventData.eligibility;
        returnData.registrationDeadline = eventData.registrationDeadline;
        returnData.eventStartDate = eventData.eventStartDate;
        returnData.eventEndDate = eventData.eventEndDate;
        returnData.registrationLimit = eventData.registrationLimit;
        returnData.eventTags = eventData.eventTags;
        returnData.price = eventData.price;
        returnData.stockQuantity = eventData.stockQuantity;
        returnData.purchaseLimit = eventData.purchaseLimit;
        returnData.variants = eventData.variants;
        const org = await organizer.findById(eventData.organizer);
        returnData.organizer = org.name;
        returnData.form = eventData.customForm;
        returnData.participantName = participantData.fName + " " + participantData.lName;

        const registered = await registration.findOne({event: eventId, participant: id});

        // Check if user is already registered
        returnData.registered = registered ? true : false;

        // Check if registration is available
        returnData.canRegister = true;

        if (eventData.status === 'Closed'){
            returnData.canRegister = false;
        }

        if (returnData.registrationLimit && returnData.registrationLimit <= eventData.registrationList.length){
            returnData.canRegister = false;
        }

        if (eventData.eventType === 'Merchandise' && eventData.stockQuantity === 0){
            returnData.canRegister = false;
        }

        if (eventData.registrationDeadline && new Date() > eventData.registrationDeadline){
            returnData.canRegister = false;
        }

        if (eventData.eligibility && (eventData.eligibility!=="Both" && eventData.eligibility !== participantData.participantType)){
            returnData.canRegister = false;
        }

        // If already registered, can't register again
        if (returnData.registered) {
            returnData.canRegister = false;
        }

        return res.json({ success: true, event: returnData });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}