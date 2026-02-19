const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({

    fName: {
        type: String,
        required: true
    },
    lName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,

        // matching for the email
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],

        //matching for IIITH and Non_IIITH emails
        validate: function(v) {
            if (this.participantType === 'IIITH') return /@(students?\.|research\.)?iiit\.ac\.in$/.test(v);
            if (this.participantType === 'Non-IIITH') return !(/@(students?\.|research\.)?iiit\.ac\.in$/.test(v));
            return true;
        }
    },
    password: {
        type: String,
        required: true
    },
    participantType: {
        type: String,
        enum: ['IIITH', 'Non-IIITH'],
        required: true
    },
    organization: {
        type: String
    },
    contact: {
        type: String
    },
    interests: [{type: String}],
    following: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Organizer'
    }],
    role: {
        type: String,
        default: 'participant'
    }
}, {timestamps: true});

module.exports = mongoose.model('Participant', participantSchema)