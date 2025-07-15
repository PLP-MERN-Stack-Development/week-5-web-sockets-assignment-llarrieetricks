const express = require('express');
const http = require('http');
const { Server } =('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // update if different
    methods: ['GET', 'POST'],
  },
});

const users = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('register', (username) => {
    users[socket.id] = { username, socketId: socket.id };
    io.emit('users', Object.values(users));
  });

  socket.on('chat message', ({ from, message, timestamp }) => {
    io.emit('chat message', { from, message, timestamp });
  });

  socket.on('typing', ({ username }) => {
    socket.broadcast.emit('typing', { username });
  });

  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing');
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('users', Object.values(users));
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.get('/', (req, res) => {
  res.send('Socket.io server is running.');
});

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

