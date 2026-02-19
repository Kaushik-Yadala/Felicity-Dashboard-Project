const event = require('../../models/event');

module.exports.dashboard = async (req, res) => {

    try {

        const {id, role} = req.user;

        const events = await event.find({organizer: id});

        const returnData = [];

        for(let i=0; i<events.length; i++) {
            const tempData = {};
            tempData.id = events[i]._id;
            tempData.name = events[i].name;
            tempData.eventType = events[i].eventType;
            tempData.status = events[i].status;

            if (tempData.status === 'Closed'){
                tempData.registrations = `${events[i].registrationList.length}`;
                // returnData.registrations = 100;
                tempData.attendance = `${events[i].registrationList.filter(p => p.registrationStatus === 'Attended').length}`;

                if (events[i].eventType === 'Merchandise') {
                    const paidRegs = events[i].registrationList.filter(p => p.payment === 'Completed');
        
                    const totalItems = paidRegs.reduce((sum, reg) => {
                        const qty = (reg.merchandise && reg.merchandise.amount) ? reg.merchandise.amount : 1;
                        return sum + qty;
                    }, 0);
        
                    tempData.revenue = `${totalItems * events[i].price}`;
                } else {
                    tempData.revenue = `${events[i].registrationList.filter(p => p.payment === 'Completed').length * events[i].price}`;
                }
            }

            returnData.push(tempData);
        }

        return res.json({ success: true, returnData });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }

}