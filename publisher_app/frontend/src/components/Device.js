import React, { useEffect, useState, useMemo, useContext } from 'react';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Card from 'react-bootstrap/Card';
import { RouterFill } from 'react-bootstrap-icons';
import AppContext from '../hooks/AppContext';

import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const Device = (args) => {
    const { backendClient } = useContext(AppContext)

    const [enabled, setEnabled] = useState(true);

    const colorNames = useMemo(() => {
        return [
            "red",
            "blue",
            "green",
            "yellow",
            "purple",
            "orange",
            "pink",
            "brown",
            "grey",
            "black",
            "cyan",
            "magenta",
            "lime",
            "teal",
            "navy",
            "maroon",
            "olive",
            "silver",
            "gold",
            "coral",
            "salmon",
            "crimson",
            "indigo",
            "violet",
            "lavender",
            "peach",
            "mint",
            "plum",
            "chocolate",
            "tan",
            "khaki",
            "azure",
            "beige",
            "ivory",
            "lavender",
            "orchid",
            "sienna",
            "peru"
        ];
    }, []);

    useEffect(() => {
        // Function to simulate and send data to Azure Event Hub
        const sendData = (enabled) => {
            if (!enabled) return; // Don't send data if the device is not enabled

            // Simulate data generation
            const temperature = (20 + Math.random() * 10).toFixed(2); // Generate random temperature between 20 and 30
            const humidity = (30 + Math.random() * 20).toFixed(2); // Generate random humidity between 30 and 50

            // Create a message object with device data
            const messages = [{
                device_id: args.id, // Device ID
                temperature: parseFloat(temperature), // Temperature value
                humidity: parseFloat(humidity), // Humidity value
                timestamp: new Date().toISOString(), // Current timestamp
            }];

            // Log the message to the console for debugging
            console.log('Sending data to Azure Event Hub:', messages);

            // Send the message batch to Azure Event Hub using the backend client
            backendClient.sendBatchToEventHubs(messages);
        };

        // Set up an interval to send data every second
        const interval = setInterval(() => sendData(enabled), 1000);

        // Cleanup the interval on component unmount
        return () => clearInterval(interval);
    }, [enabled, args.id, backendClient]); // Dependencies for the useEffect hook

    return (
        <Card className='m-2'>
            <Card.Header>
                Device {args.id}
                <ToggleButton
                    className='ms-4'
                    id={`toggle-check-${args.id}`}
                    type="checkbox"
                    variant={enabled ? "outline-danger" : "outline-primary"}
                    checked={enabled}
                    onChange={(e) => setEnabled(e.currentTarget.checked)}
                    >
                        {enabled ? 'Deactivate' : 'Activate'} 
                    </ToggleButton> 
                </Card.Header>
            <Card.Body>
                <RouterFill color={colorNames[args.id]} size={96}/>
            </Card.Body>
        </Card>
    );
};

export default Device;