import { useState, useEffect } from "react";

const useEventAggregator = (initialEvents) => {

  const [events, setEvents] = useState([]);
  const [deviceIds, setDeviceIds] = useState([]);
  useEffect(() => {
    if(!initialEvents) return;
    setEvents(initialEvents);
    setDeviceIds([...new Set(initialEvents.map((event) => event.device_id))]);
  }, [initialEvents]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5001"); // Replace with your server URL

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    socket.onmessage = (message) => {
      const event = JSON.parse(message.data);
      setEvents([...events, event]);
      setDeviceIds((prevDeviceIds) => {
        const newDeviceId = event.device_id;
        if (!prevDeviceIds.includes(newDeviceId)) {
          return [...prevDeviceIds, newDeviceId];
        }
        return prevDeviceIds;
      });

      console.log("Message received:", event);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      socket.close();
    };
  }, [events, deviceIds]);

  return [events, deviceIds]
}

export default useEventAggregator;