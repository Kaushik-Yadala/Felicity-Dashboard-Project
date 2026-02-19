const Event = require('../../../models/event');

module.exports.editEventPost = async (req, res) => {
    try {
        const { id } = req.user;
        const { eventId } = req.params;
        
        const eventData = await Event.findById(eventId);

        if (!eventData) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (eventData.organizer.toString() !== id) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to event data' });
        }

        const update = {};
        const incoming = req.body;

        if (incoming.customForm) {
            if (eventData.participants && eventData.participants.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Cannot edit Form Builder fields because registrations have already started.' 
                });
            }
            update.customForm = incoming.customForm;
        }

        if (eventData.status === 'Draft') {
            if (incoming.name) update.name = incoming.name;
            if (incoming.desc) update.desc = incoming.desc;
            if (incoming.eventType) update.eventType = incoming.eventType;
            if (incoming.eligibility) update.eligibility = incoming.eligibility;
            if (incoming.registrationDeadline) update.registrationDeadline = incoming.registrationDeadline;
            if (incoming.eventStartDate) update.eventStartDate = incoming.eventStartDate;
            if (incoming.eventEndDate) update.eventEndDate = incoming.eventEndDate;
            if (incoming.registrationLimit) update.registrationLimit = incoming.registrationLimit;
            if (incoming.registrationFee) update.registrationFee = incoming.registrationFee;
            if (incoming.eventTags) update.eventTags = incoming.eventTags;
            if (incoming.price) update.price = incoming.price;

            if (incoming.eventType === 'Merchandise' || eventData.eventType === 'Merchandise') {
                if (incoming.stockQuantity) update.stockQuantity = incoming.stockQuantity;
                if (incoming.purchaseLimit) update.purchaseLimit = incoming.purchaseLimit;
                if (incoming.variants) update.variants = incoming.variants;
            }
            
            if (incoming.status === 'Published') update.status = 'Published';
            

        } else if (eventData.status === 'Published') {
            if (incoming.desc) update.desc = incoming.desc;

            if (incoming.registrationDeadline) {
                const newDeadline = new Date(incoming.registrationDeadline);
                if (newDeadline <= eventData.registrationDeadline) {
                    return res.status(400).json({ success: false, message: 'Deadline can only be extended, not shortened.' });
                }
                update.registrationDeadline = newDeadline;
            }

            if (incoming.registrationLimit) {
                if (incoming.registrationLimit < eventData.registrationLimit) {
                    return res.status(400).json({ success: false, message: 'Registration limit can only be increased.' });
                }
                update.registrationLimit = incoming.registrationLimit;
            }

            if (incoming.status === 'Closed' || incoming.status === 'Ongoing') {
                update.status = incoming.status;
            }
            
            if (incoming.name || incoming.price || incoming.eventStartDate) {
                return res.status(400).json({ success: false, message: 'Cannot edit core details (Name, Price, Dates) while Published.' });
            }

        } else if (['Ongoing', 'Completed', 'Closed'].includes(eventData.status)) {
            if (incoming.status && ['Completed', 'Closed'].includes(incoming.status)) {
                update.status = incoming.status;
            } else if (Object.keys(incoming).length > 0 && !incoming.status) {
                return res.status(400).json({ success: false, message: 'Cannot edit an Ongoing or Completed event.' });
            }
        }

        const updatedEvent = await Event.findByIdAndUpdate(eventId, update, { 
            new: true, 
            runValidators: true 
        });

        return res.json({ success: true, event: updatedEvent });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}