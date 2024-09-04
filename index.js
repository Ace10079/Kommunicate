const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();  // Load environment variables from .env file and upload

const app = express();
app.use(bodyParser.json());
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Define a schema for storing conversations
const conversationSchema = new mongoose.Schema({
    groupId: String,
    messages: [{
        key: String,
        message: String,
        from: String,
        timeStamp: Number,
        metadata: Object
    }]
});

// Create a model for the conversations
const Conversation = mongoose.model('Conversation', conversationSchema);

// Authentication token configuration
const expectedAuthHeader = 'Basic YWJjZGVm';  // Example Base64 token for 'username:abcdef'

// Endpoint to receive webhook data
app.post('/message', async (req, res) => {
    try {
        const receivedAuthHeader = req.headers.authorization;

        if (receivedAuthHeader === expectedAuthHeader) {
            const data = req.body;
            console.log('Received Data:', data);

            // Extract the required information from the request body
            const { key, message, from, groupId, metadata } = data;

            // Find the conversation by groupId
            let conversation = await Conversation.findOne({ groupId: groupId.toString() });

            if (!conversation) {
                // If no conversation exists, create a new one
                conversation = new Conversation({
                    groupId: groupId.toString(),
                    messages: []
                });
            }

            // Add the new message to the conversation
            conversation.messages.push({
                key: key,
                message: message,
                from: from,
                timeStamp: Date.now(),
                metadata: metadata
            });

            // Save the updated conversation
            const savedConversation = await conversation.save();

            console.log('Conversation updated:', savedConversation);
            res.status(200).send('Message received and conversation updated successfully.');
        } else {
            console.log('Received Auth Header:', receivedAuthHeader);
            res.status(401).send('Unauthorized');
        }
    } catch (error) {
        console.error('Error updating conversation:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
