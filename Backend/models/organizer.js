const mongoose = require('mongoose');

const organizerSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,

        // matching for the email
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
    },
    password: {
        type: String,
        required: true
    },
    desc: {
        type: String
    },
    role: {
        type: String,
        default: 'organizer'
    },
    valid: {
        type: Boolean,
        default: true
    },
    category: {
        type: String,
        default: 'tech'
    },
    contact: {
        type: String
    },
    discord: {
        type: String,
    },
    followers: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Participant'
    }]

}, {timestamps: true});

module.exports = mongoose.model('Organizer', organizerSchema)