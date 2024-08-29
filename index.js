const express = require('express');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();  // Load environment variables from .env file

// Middleware to parse JSON requests
app.use(express.json());

// MongoDB connection string from .env file
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error: ', err));

// Define a schema for storing chatbot messages
const messageSchema = new mongoose.Schema({
    key: String,
    from: String,
    groupId: Number,
    clientGroupId: String,
    groupName: String,
    message: String,
    timeStamp: Number,
    receiverConnected: Boolean,
    receiverLastSeenAtTime: Number,
    file: {
        name: String,
        url: String,
        contentType: String,
        size: Number,
        thumbnailUrl: String
    },
    metadata: Object
});

// Create a model for the messages
const Message = mongoose.model('Message', messageSchema);

// Authentication token configuration
const expectedAuthHeader = 'Basic YWJjZGVm';  // Base64 for 'abcdef'

// Endpoint to receive webhook data
app.post('/message', (req, res) => {
    const authHeader = req.headers['authorization'];
    
    // Verify the authentication token
    if (authHeader === expectedAuthHeader) {
        const messageData = req.body;

        // Save the message data to the database
        const newMessage = new Message(messageData);
        newMessage.save()
            .then(() => {
                console.log('Message saved:', messageData);
                res.status(200).send('Data received and stored');
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
