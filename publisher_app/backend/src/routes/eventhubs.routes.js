const express = require('express');
const { EventHubProducerClient } = require('@azure/event-hubs');
const path = require('path');

// Load environment variables from a .env file located two levels up from the current directory
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Azure Event Hubs details
// Connection string and Event Hub name are retrieved from environment variables
const connectionString = process.env.REACT_APP_EVENT_HUB_NAMESPACE_CONN_STR;
const eventHubName = process.env.REACT_APP_EVENT_HUB_NAME;

// Create a new EventHubProducerClient instance to send events to the Event Hub
const producerClient = new EventHubProducerClient(
    connectionString, // Connection string to the Event Hub namespace
    eventHubName      // Name of the Event Hub
);

const router = express.Router();

router.post('/sendBatchToEventHubs', async (req, res) => {
    try {
        let messages = Object.prototype.toString.call(req.body.msgs) === "[object Array]" ? req.body.msgs : [req.body.msgs];
        let batch = await producerClient.createBatch();
        for (let i = 0; i < messages.length; i++) {
            if (!batch.tryAdd({ body: messages[i] })) {
              await producerClient.sendBatch(batch);
              batch = await producerClient.createBatch();
              if (!batch.tryAdd({ body: messages[i] })) {
                throw new Error("Message too big to fit");
              }
            }
             if (i === messages.length - 1) {
                const sendResult = await producerClient.sendBatch(batch);
              }
           }
        console.log(`Sent request to event hub ${eventHubName}!`);
        res.status(200).send(`Sent request to event hub ${eventHubName}!`)
    } catch(e) {
        res.status(500).send(e.message);
    }
});

module.exports = router;

