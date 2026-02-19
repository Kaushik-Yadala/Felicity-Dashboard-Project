const message = require('../models/message');

const prevMessages = async (roomId) => {
    return await message.find({ eventId: roomId }).sort({ createdAt: 1 });
}

module.exports = (io, socket) => {

    // join a room
    const joinRoom = async (roomId) => {
        socket.join(roomId);

        const previousMessages = await prevMessages(roomId);
        socket.emit('previousMessages', previousMessages);

        console.log(`Socket ${socket.id} joined room ${roomId}`);
    }

    const handleMessage = async (messageData) => {

        const { eventId, messageType, senderId, organizerId, content, referencedMessageId, status, senderName } = messageData;

        const newMessage = new message({
            eventId,
            messageType,
            senderId,
            organizerId,
            content,
            referencedMessageId,
            status,
            senderName
        });

        const savedMessage = await newMessage.save();

        // If this is a reply, update the parent message's referencedBy array
        if (referencedMessageId) {
            await message.findByIdAndUpdate(
                referencedMessageId,
                { $push: { referencedBy: savedMessage._id } }
            );
        }

        io.to(eventId).emit('newMessage', savedMessage);

    }

    const handleMessageStatusUpdate = async (data) => {
        const { eventId, messageId, status } = data;
        
        await message.findByIdAndUpdate(
            messageId,
            { status: status }
        );
        
        io.to(eventId).emit('messageStatusUpdate', {
            messageId: messageId,
            status: status
        });
        
        console.log(`Message ${messageId} status updated to ${status} in room ${eventId}`);
    }

    socket.on('joinRoom', joinRoom);
    socket.on('message', handleMessage);
    socket.on('messageStatusUpdate', handleMessageStatusUpdate);
}