const event = require('../../../models/event');
const registration = require('../../../models/registration');
const participant = require('../../../models/participant');

module.exports.viewEvent = async (req, res) => {

    const {id, role} = req.user;
    const {eventId} = req.params;

    try {
        // Parallel execution of all database queries for better performance
        const [eventData, registrations, followers] = await Promise.all([
            event.findOne({_id: eventId}).lean(),
            registration.find({ event: eventId })
                .populate({
                    path: 'participant',
                    select: 'fName lName email contact participantType organization'
                })
                .select('ticketID registrationStatus payment formResponses merchandise createdAt attendanceDate')
                .lean(),
            participant.find(
                { following: id },
                { fName: 1, lName: 1, email: 1, contact: 1, participantType: 1, organization: 1 }
            ).lean()
        ]);

        if(!eventData) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if(eventData.organizer.toString() !== id) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to event data' });
        }

        // Build return data efficiently
        const returnData = {
            name: eventData.name,
            desc: eventData.desc,
            eventType: eventData.eventType,
            eligibility: eventData.eligibility,
            registrationDeadline: eventData.registrationDeadline,
            eventStartDate: eventData.eventStartDate,
            eventEndDate: eventData.eventEndDate,
            registrationLimit: eventData.registrationLimit,
            eventTags: eventData.eventTags,
            price: eventData.price,
            stockQuantity: eventData.stockQuantity,
            purchaseLimit: eventData.purchaseLimit,
            variants: eventData.variants,
            customForm: eventData.customForm,
            registrationList: eventData.registrationList,
        };



        // Add followers
        returnData.followers = followers;

        // Format registered participants efficiently
        returnData.registeredParticipants = registrations.map(reg => ({
            registrationId: reg._id,
            ticketID: reg.ticketID,
            registrationStatus: reg.registrationStatus,
            payment: reg.payment,
            formResponses: reg.formResponses,
            merchandise: reg.merchandise,
            createdAt: reg.createdAt,
            participant: reg.participant,
            attendanceDate: reg.attendanceDate
        }));

        // Calculate stats
        const regList = returnData.registeredParticipants || [];
        returnData.registrations = regList.length;
        returnData.attendance = regList.filter(p => p.registrationStatus === 'Attended').length;

        // Calculate revenue
        if (eventData.eventType === 'Merchandise') {
            const totalItems = regList
                .filter(p => p.payment === 'Completed')
                .reduce((sum, reg) => {
                    const qty = (reg.merchandise?.amount && typeof reg.merchandise.amount === 'number') 
                        ? reg.merchandise.amount 
                        : 1;
                    return sum + qty;
                }, 0);
            returnData.revenue = totalItems * (eventData.price || 0);
        } else {
            returnData.revenue = regList.filter(p => p.payment === 'Completed').length * (eventData.price || 0);
        }

        return res.json({ success: true, event: returnData });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}