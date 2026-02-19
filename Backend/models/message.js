const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({

    eventId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
    },
    messageType: {
        type: String,
        enum: ["message", "question", "announcement", "response"],
        default: 'message'
    },
    senderId: { // set in the case of message and question
        type: String,
    },
    organizerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Organizer',
    },
    content: { // set in the case of announcement and response
        type: String,
    },
    referencedBy: [{ // array of messages that reference this message (replies)
        type: mongoose.Schema.ObjectId,
        ref: 'Message',
    }],
    referencedMessageId: { // the message this is replying to (for response type)
        type: mongoose.Schema.ObjectId,
        ref: 'Message',
    },
    status: {
        type: String,
        enum: ['normal', 'deleted', 'pinned'],
        default: 'normal'
    },
    senderName: {
        type: String,
    }

});

module.exports = mongoose.model('Message', messageSchema);