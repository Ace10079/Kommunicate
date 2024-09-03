const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();  // Load environment variables from .env file

const app = express();
app.use(bodyParser.json());
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Define a schema for storing webhook messages
const messageSchema = new mongoose.Schema({
    key: String,
    message: String,
    from: String,
    groupId: String,
    timeStamp: Number,
    metadata: Object
});

// Create a model for the messages
const Message = mongoose.model('Message', messageSchema);

// Authentication token configuration
const expectedAuthHeader = 'Basic YWJjZGVm';  // Example Base64 token for 'username:abcdef'

// Endpoint to receive webhook data
app.post('/message', (req, res) => {
    const authHeader = req.headers['authorization'];
    console.log('Received Auth Header:', authHeader);

    // Verify the authentication token
    if (authHeader === expectedAuthHeader) {
        const messageData = req.body;

        // Log the incoming data for debugging
        console.log('Received Data:', messageData);

        // Create and save the message data to MongoDB
        const newMessage = new Message({
            key: messageData.key || "unknown",
            message: messageData.message || "No message content",
            from: messageData.from || "unknown",
            groupId: messageData.groupId || "unknown",
            timeStamp: messageData.timeStamp || Date.now(),
            metadata: messageData.metadata || {}
        });

        newMessage.save()
            .then(() => {
                console.log('Message saved:', newMessage);
                res.status(200).json({ "message": "Webhook triggered and data stored successfully" });
            })
            .catch(err => {
                console.error('Error saving message:', err);
                res.status(500).send('Error storing data');
            });
    } else {
        res.status(401).send('Unauthorized');
    }
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
