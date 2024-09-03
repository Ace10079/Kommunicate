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
app.post('/message', async (req, res) => {
    try {
      const receivedAuthHeader = req.headers.authorization;
      
      if (receivedAuthHeader === 'Basic YWJjZGVm') {
        const data = req.body;
        console.log('Received Data:', data);
        
        // Extract the required information from the request body
        const { key, message, from, groupId, metadata } = data;
        
        // Save the data to MongoDB
        const savedMessage = await Message.create({
          key: key,
          message: message,
          from: from,
          groupId: groupId.toString(),
          timeStamp: Date.now(),
          metadata: metadata
        });
        
        console.log('Message saved:', savedMessage);
        res.status(200).send('Message received and saved successfully.');
      } else {
        console.log('Received Auth Header:', receivedAuthHeader);
        res.status(401).send('Unauthorized');
      }
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
