const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    
    participant: {
        type: mongoose.Schema.ObjectId,
        ref: 'Participant',
        required: true
    },
    event: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
        required: true
    },
    ticketID: {
        type: String,
        required: true,
        unique: true
    },
    formResponses: [{
        questionLabel: {
            type: String,
        },
        answer: {
            type: mongoose.Schema.Types.Mixed,
        }
    }],
    registrationStatus: {
        type: String,
        enum: ['Pending','Registered', 'Cancelled', 'Attended'],
        default: 'Registered'
    },
    payment: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    merchandise: {
        amount:{
            type: Number,
            default: 1
        },
        paymentProof:{
            type: String,
            default: ''
        }
    },
    attendanceDate: {
        type: Date,
        default: null
    }
}, {timestamps: true});

module.exports = mongoose.model('Registration', registrationSchema);