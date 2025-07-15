import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [typingUser, setTypingUser] = useState('');
  let typingTimeout;

  useEffect(() => {
    socket.on('users', (userList) => {
      setUsers(userList);
    });

    socket.on('chat message', ({ from, message, timestamp }) => {
      setChatLog((prev) => [...prev, { from, message, timestamp }]);
    });

    socket.on('typing', ({ username }) => {
      setTypingUser(`${username} is typing...`);
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        setTypingUser('');
      }, 2000);
    });

    socket.on('stop typing', () => {
      setTypingUser('');
    });

    return () => socket.disconnect();
  }, []);

  const handleLogin = () => {
    if (username.trim()) {
      setIsLoggedIn(true);
      socket.emit('register', username);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      const timestamp = new Date().toLocaleTimeString();
      socket.emit('chat message', { from: username, message, timestamp });
      setChatLog((prev) => [...prev, { from: 'Me', message, timestamp }]);
      setMessage('');
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit('typing', { username });

    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit('stop typing');
    }, 1500);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      {!isLoggedIn ? (
        <>
          <h2>Enter your username</h2>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
          />
          <button onClick={handleLogin}>Join Chat</button>
        </>
      ) : (
        <>
          <h2>Welcome, {username}</h2>
          <h3>Online Users:</h3>
          <ul>
            {users
              .filter((u) => u.username !== username)
              .map((user) => (
                <li key={user.socketId}>{user.username}</li>
              ))}
          </ul>

          {typingUser && (
            <p style={{ fontStyle: 'italic', color: 'gray' }}>{typingUser}</p>
          )}

          <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            <h4>Global Chat</h4>
            {chatLog.map((chat, i) => (
              <p key={i}>
                <strong>{chat.from}</strong> ({chat.timestamp}): {chat.message}
              </p>
            ))}
          </div>

          <input
            value={message}
            onChange={handleTyping}
            placeholder="Type a message"
          />
          <button onClick={handleSend}>Send</button>
        </>
      )}
    </div>
  );
}

export default App;
