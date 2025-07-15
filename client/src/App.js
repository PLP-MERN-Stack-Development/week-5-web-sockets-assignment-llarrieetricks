import React, { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // match server port

function App() {
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Socket.IO Chat</h1>
    </div>
  );
}

export default App;
