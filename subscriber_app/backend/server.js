const express = require('express');
const path = require('path');
const apiRoutes = require('./src/routes/eventhubs.routes');
const restrictToLocalhost = require('./src/middleware/restrict.middleware');
const corsMiddleware = require('./src/middleware/cors.middleware');
const bodyParser = require('body-parser');

// Server setup
const app = express();
var expressWs = require('express-ws')(app);
const clients = new Set(); // Store connected clients

const { EventHubConsumerClient } = require('@azure/event-hubs');

const dotenv = require('dotenv').config({path: path.join(__dirname, '.env')});

// Set up the WebSocket server
app.ws('/', function(ws, req) {
    console.log("New connection has opened!");
    clients.add(ws);

    ws.on('close', function() {
        console.log('The connection was closed!');
        clients.delete(ws);
    });

    ws.on('message', function (message) {
        console.log('Message received: '+message);
        ws.send(message)
    });
  });

const broadcastMessage = (data) => {
clients.forEach((client) => {
      if (client.readyState === 1) {
      client.send(JSON.stringify(data));
      }
  });
};

// Azure Event Hubs details
const connectionString = process.env.REACT_APP_EVENT_HUB_NAMESPACE_CONN_STR;
const eventHubName = process.env.REACT_APP_EVENT_HUB_NAME;
const consumerGroup = process.env.REACT_APP_EVENT_HUB_CONSUMER_GROUP;

// TODO: Implement a wrapper for the EventHubConsumerClient that returns a dummy object if emulating is enabled. 
async function startEventHubConsumer() {
  const consumerClient = new EventHubConsumerClient(
    consumerGroup,
    connectionString,
    eventHubName
  );
 
  consumerClient.subscribe({
    processEvents: async (events) => {
      for (const event of events) {
        console.log("Received event:", event.body);
        broadcastMessage(event.body); // Send to frontend via WebSockets
      }
    },
    processError: async (err) => {
      console.error("Error:", err);
    },
  });

  console.log("Listening for Azure Event Hub messages...");
}
startEventHubConsumer();

// Middleware
app.use('/api/*', restrictToLocalhost);
app.use(corsMiddleware);
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies


// API Routes
app.use('/api', apiRoutes);

// // Serve frontend
// app.use(express.static(path.join(__dirname, '../frontend', 'build')));
// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend', 'build', "index.html"));
// });

// Start server
const port = process.env.EXPRESS_PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



