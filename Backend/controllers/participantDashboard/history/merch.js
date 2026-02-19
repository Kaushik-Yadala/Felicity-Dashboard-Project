const registration = require('../../../models/registration');
const event = require('../../../models/event');
const organizer = require('../../../models/organizer');

module.exports.merch = async (req, res) => {

    try{

        const user = req.user;

        const registrations = await registration.find({participant: user.id}).populate({ path: 'event', populate: { path: 'organizer', select: 'name' }});

        const upcomingEvents = registrations.filter(reg =>reg.event && reg.event.eventType === "Merchandise")
                                            .map(function(reg) {return {
                                                id: reg.event._id,
                                                name: reg.event.name,
                                                organizer: reg.event.organizer.name,
                                                eventType: reg.event.eventType,
                                                eventStartDate: reg.event.eventStartDate,
                                                eventEndDate: reg.event.eventEndDate,
                                            }})

        return res.json({ success: true, upcomingEvents });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}