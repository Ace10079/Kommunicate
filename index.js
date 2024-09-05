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

// Define a schema for complaints with structured fields
const complaintSchema = new mongoose.Schema({
    groupId: String,
    complaint_type_title: String,
    dept_name: String,
    tat_type: String,
    tat_duration: String,
    priority: String,
    escalation_type: String,
    escalation_11: String,
    role_11: String,
    status: String,
    created_by_user: String,
    createdAt: { type: Date, default: Date.now }
});

const Complaint = mongoose.model('Complaint', complaintSchema);

// Authentication token configuration
const expectedAuthHeader = 'Basic YWJjZGVm';  // Example Base64 token for 'username:abcdef'

// Endpoint to receive webhook data
app.post('/message', async (req, res) => {
    try {
        const receivedAuthHeader = req.headers.authorization;

        if (receivedAuthHeader === expectedAuthHeader) {
            const data = req.body;
            console.log('Received Data:', data);

            const { groupId, messages } = data;

            // Initialize an object to store structured data
            const complaintData = {
                groupId: groupId.toString(),
                complaint_type_title: '',  // Extract from messages
                dept_name: '',              // Extract from messages
                tat_type: 'month',          // Example default value
                tat_duration: '10 hrs',     // Example default value
                priority: 'Medium',         // Example default value
                escalation_type: 'day',     // Example default value
                escalation_11: '1',         // Example default value
                role_11: 'superadmin',      // Example default value
                status: 'active',           // Example default value
                created_by_user: 'admin',   // Example default value
            };

            // Loop through the messages and map them to appropriate fields
            messages.forEach((messageObj, index) => {
                const { message } = messageObj;

                // Map messages to structured fields
                if (index === 0) complaintData.complaint_type_title = message; // Assuming first message is complaint type
                if (index === 1) complaintData.dept_name = message;            // Assuming second message is dept_name
                // You can continue mapping other fields as needed...
            });

            // Save the structured data in the database
            const newComplaint = new Complaint(complaintData);
            await newComplaint.save();

            console.log('Complaint data saved:', newComplaint);
            res.status(200).send('Complaint data saved successfully.');
        } else {
            console.log('Received Auth Header:', receivedAuthHeader);
            res.status(401).send('Unauthorized');
        }
    } catch (error) {
        console.error('Error saving complaint data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
