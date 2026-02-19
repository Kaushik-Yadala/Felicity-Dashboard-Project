const mongoose = require('mongoose');
const organizer = require('./organizer');

const resetSchema = new mongoose.Schema({

    organizer: {
        type: mongoose.Schema.ObjectId,
        ref: 'Organizer',
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    comments: {
        type: String,
        default: ''
    }
}, {timestamps: true});

module.exports = mongoose.model('Reset', resetSchema);