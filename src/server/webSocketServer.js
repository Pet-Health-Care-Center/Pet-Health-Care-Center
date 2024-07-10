const WebSocket = require('ws');

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
      console.log('Received:', message);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });

    ws.send(JSON.stringify({ message: 'Connected to WebSocket server' }));
  });

  wss.on('error', (error) => {
    console.error('WebSocket Server Error:', error);
  });

  return wss;
};

module.exports = setupWebSocket;
