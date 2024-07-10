// src/WebSocketClient.js
import React, { useEffect, useState } from 'react';

const WebSocketClient = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      ws.send('Hello Server!');
    };

    ws.onmessage = (event) => {
      setMessages(prevMessages => [...prevMessages, event.data]);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      ws.close();
    };
  }, []);

};

export default WebSocketClient;