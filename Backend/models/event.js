const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    desc: {
        type: String
    },
    eventType: {
        type: String,
        enum: ['Normal', 'Merchandise'],
        required: function() { return this.status === 'Published'; },
        default: 'Normal'
    },
    eligibility: {
        type: String,
        enum: ['IIITH', 'Non-IIITH', 'Both'],
        required: function() { return this.status === 'Published'; }
    },
    registrationDeadline: {
        type: Date,
        required: function() { return this.status === 'Published'; }
    },
    eventStartDate: {
        type: Date,
        required: function() { return this.status === 'Published'; }
    },
    eventEndDate: {
        type: Date,
        required: function() { return this.status === 'Published'; }
    },
    registrationLimit: {
        type: Number,
        required: function() { 
            return this.status === 'Published' && this.eventType !== 'Merchandise'; 
        }
    },
    organizer: {
        type: mongoose.Schema.ObjectId,
        ref: 'Organizer',
        required: true
    },
    eventTags: [{ type: String }],

    registrationList: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Registration'
    }],

    price: { type: Number, default: 0 },

    status: {
        type: String,
        enum: ['Draft', 'Published', 'Ongoing', 'Closed'],
        default: 'Draft'
    },

    // Normal
    customForm: [{ //list of elements of the form to build it in the future in react
        label: { type: String },
        fieldType: {
            type: String,
            enum: ['text', 'number', 'dropdown']
        },
        options: [{ type: String }],
        required: { type: Boolean, default: false },
        order: { type: Number } // to maintain the order of form fields
    }],

    // Merch
    stockQuantity: { type: Number, default: 0, required: function() { return this.eventType === 'Merchandise'; } },
    purchaseLimit: { type: Number, required: function() { return this.eventType === 'Merchandise'; } },
    variants: [{ // the different variants of the stock they have
        name: { type: String },
        options: [{ type: String }]
    }],

    visits: {
         type: Number,
          default: 0 
        }


}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);