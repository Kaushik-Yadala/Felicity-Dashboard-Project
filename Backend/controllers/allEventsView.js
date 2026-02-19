const event = require('../models/event');
const organizer = require('../models/organizer'); // Assuming your Organizer is also a User model
const participant = require('../models/participant');

module.exports.allEventsView = async (req, res) => {
    try {
        // Example URL: /api/events?search=hackathon&type=Normal&startDate=2026-01-01
        const { 
            search, 
            eventType, 
            eligibility, 
            eventStartDate, 
            eventEndDate, 
            showFollowed,
            status
        } = req.query;

        let query = {};

        if (search) {
            // Step A: Find IDs of Organizers whose name matches the search
            const matchingOrganizers = await organizer.find({
                name: { $regex: search, $options: 'i' }, // 'i' = case insensitive
                role: 'organizer' 
            }).select('_id');

            const organizerIds = matchingOrganizers.map(org => org._id);

            // Step B: Search Events where (Name matches OR Organizer is in the list)
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { organizer: { $in: organizerIds } }
            ];
        }

        if (eventType) {
            query.eventType = eventType; // e.g., 'Normal' or 'Merchandise'
        }

        if (status) {
            query.status = status; // e.g., 'Open', 'Closed', 'Cancelled'
        }
        
        if (eligibility) {
            query.eligibility = eligibility; // e.g., 'IIITH'
        }

        if (eventStartDate || eventEndDate) {
            query.eventStartDate = {};
            // Events starting AFTER the user's start date
            if (eventStartDate) query.eventStartDate.$gte = new Date(eventStartDate);
            // Events starting BEFORE the user's end date
            if (eventEndDate) query.eventStartDate.$lte = new Date(eventEndDate);
        }

        if (showFollowed === 'true' && req.user) {
            const currentUser = await participant.findById(req.user.id);
            
            if (currentUser && currentUser.followedOrganizers) {
                if (query.$or) {
                    query.$and = [
                        { $or: query.$or },
                        { organizer: { $in: currentUser.followedOrganizers } }
                    ];
                    delete query.$or;
                } else {
                    query.organizer = { $in: currentUser.followedOrganizers };
                }
            }
        }

        const events = await event.find(query)
            .select("_id name eventType eligibility registrationDeadline eventStartDate eventEndDate registrationLimit organizer eventTags price status visits")
            .populate('organizer', 'name') // <--- Important for display
            .sort({ createdAt: -1 }) // Default sort: Newest first
            .lean();

        return res.json({ 
            success: true, 
            count: events.length, 
            events 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}