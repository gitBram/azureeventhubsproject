// Importing the logo and CSS for styling
import './App.css';

// Importing React and hooks for state management and lifecycle methods
import React, { useEffect, useState } from 'react';

// Importing a custom backend client for API calls
import { BackendClient } from './clients/BackendClient';

// Importing a custom hook for aggregating events from a socket
import useEventAggregator from './hooks/useEventAggregator';

// Importing Chart.js modules for creating charts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Importing the Line chart component from react-chartjs-2
import { Line } from 'react-chartjs-2';

// Importing date adapter for Chart.js to handle time-based data
import 'chartjs-adapter-date-fns';

// Registering Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

// Chart configuration options
const options = {
  responsive: true, // Makes the chart responsive
  plugins: {
    legend: {
      position: 'top', // Position of the legend
    },
    title: {
      display: true, // Display the chart title
      text: 'Measure Temperature & Humidity', // Title text
    },
    },
    scales: {
    x: {
      type: 'time', // X-axis is time-based
      time: {
      unit: 'minute', // Major ticks represent minutes
      tooltipFormat: 'yyyy-MM-dd HH:mm:ss', // Tooltip format for timestamps
      displayFormats: {
        hour: 'HH:mm', // Format for hour-level ticks
      },
      },
      ticks: {
      autoSkip: true, // Automatically skip ticks to prevent overlap
      maxRotation: 0, // Prevent rotation of tick labels
      minRotation: 0, // Prevent rotation of tick labels
      },
    },
    y: {
      ticks: {
        // Custom callback to append °C to y-axis labels
        callback: function (value, index, ticks) {
          return value + ' °C';
        },
      },
      type: 'linear', // Linear scale for temperature
      display: true, // Display the y-axis
      position: 'left', // Position on the left
    },
    y1: {
      ticks: {
        // Custom callback to append % to y1-axis labels
        callback: function (value, index, ticks) {
          return value + ' %';
        },
      },
      type: 'linear', // Linear scale for humidity
      display: true, // Display the y1-axis
      position: 'right', // Position on the right
      grid: {
        drawOnChartArea: false, // Disable grid lines for this axis
      },
    },
  },
};

// Main App component
function App() {
  // State to store initial events fetched from the backend
  const [initialEvents, setInititalEvents] = useState([]);

  // State to store the currently selected device ID
  const [chosenDeviceId, setChosenDeviceId] = useState(null);

  // State to store the currently selected historical data timeframe
  const [historicalDataTimeframe, setHistoricalDataTimeframe] = useState(null);

  // useEffect to fetch initial data from the backend when the component mounts
  useEffect(() => {
    const backendClient = new BackendClient(`http://localhost:${process.env.REACT_APP_FRONTEND_PORT}`); // Initialize the backend client with the server URL
    backendClient
      .query(
      'select * from dbo.EventsTable where timestamp > DATEADD(MINUTE, -@timeframe, GETDATE())', // SQL query to fetch events more recent than the specified timeframe
      [
        {
        name: 'timeframe', // Parameter name
        type: 'this.sql.Int()', // Parameter type
        value: historicalDataTimeframe || 0, // Parameter value, default to 0 if no timeframe is selected
        },
      ]
      )
      .then((data) => setInititalEvents(data)); // Update the state with the fetched data
  }, [historicalDataTimeframe]); // Empty dependency array ensures this runs only once when the component mounts



  // Custom hook to aggregate live events from a socket
  const [liveEvents, deviceIds] = useEventAggregator(initialEvents);

  useEffect(() => {
    if (chosenDeviceId === null && deviceIds.length > 0){
      setChosenDeviceId(deviceIds[0]) // Set the first device ID as the default selected device
    }
  }, [deviceIds, chosenDeviceId]);

  return (
    <div className="App">
      <header className="App-header" style={{ width: '100%', height: '100%' }}>
        {/* Page title */}
        <h1>Device Data Graph</h1>

        {/* Dropdown to select a device */}
        <label style={{ marginBottom: '10px' }}>
          Select a device:        
        </label>
        <select
          value={chosenDeviceId || ''}
          onChange={(e) => {
            const selectedDeviceId = e.target.value;
            setChosenDeviceId(selectedDeviceId); // Update the selected device ID
          }}
          style={{ marginBottom: '20px', padding: '10px', fontSize: '16px' }}
        >
          <option value="" disabled>
            Select a device
          </option>
          {deviceIds.map((deviceId, index) => (
            <option key={index} value={deviceId}>
              {deviceId}
            </option>
          ))}
        </select>


        {/* Dropdown to select historical data timeframe */}
        <label style={{ marginBottom: '10px' }}>
          Amount of historical data to load from SQL DB:        
        </label>
        <select
          value={historicalDataTimeframe || 0}
          onChange={(e) => {
            const selectedHistoricalDataTimeframe = e.target.value;
            setHistoricalDataTimeframe(selectedHistoricalDataTimeframe); // Update the selected device ID
            console.log('dropdown changed', selectedHistoricalDataTimeframe);
          }}
          style={{ marginBottom: '20px', padding: '10px', fontSize: '16px' }}
        >
          <option key={1} value={0}>
            No history
          </option>
          <option key={2} value={5}>
            5 minutes
          </option>
          <option key={3} value={60}>
            1 hour
          </option>
          <option key={4} value={60*24}>
            24 hours
          </option>
        </select>

        {/* Chart container */}
          <div
            style={{
              border: '1px solid red',
              width: '60%',
              height: '60%',
              margin: '0 auto', // Center the chart horizontally
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center', // Center the chart vertically
            }}
          >
            <Line
              options={options} // Chart configuration options
            data={{
              datasets: [
                {
                  label: 'temperature', // Dataset label for temperature
                  data: liveEvents
                    .filter(
                      (event) =>
                        !chosenDeviceId ||
                        String(event.device_id) === String(chosenDeviceId)
                    )
                    .map((event) => {
                      return {
                        x: event.timestamp.split('.')[0], // X-axis value (timestamp)
                        y: event.temperature, // Y-axis value (temperature)
                      };
                    }),
                  borderColor: 'rgb(255, 255, 0)', // Line color
                  backgroundColor: 'rgba(53, 162, 235, 0.5)', // Fill color
                  yAxisID: 'y', // Associated y-axis
                },
                {
                  label: 'humidity', // Dataset label for humidity
                  data: liveEvents
                    .filter(
                      (event) =>
                        !chosenDeviceId ||
                        String(event.device_id) === String(chosenDeviceId)
                    )
                    .map((event) => {
                      return {
                        x: event.timestamp.split('.')[0], // X-axis value (timestamp)
                        y: event.humidity, // Y-axis value (humidity)
                      };
                    }),
                  borderColor: 'rgb(255, 0, 255)', // Line color
                  backgroundColor: 'rgba(53, 162, 235, 0.5)', // Fill color
                  yAxisID: 'y1', // Associated y-axis
                },
              ],
            }}
          />
        </div>
      </header>
    </div>
  );
}

// Exporting the App component as the default export
export default App;