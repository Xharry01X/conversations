import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_KEY = 'wys_YMaL6zUeqo1JTogaaPEO1X9cSnzNdW3wNNZG';
const API_BASE_URL = 'https://ad6eac20e88649a6a1af3eed83e2b50e.weavy.io/api';

const userData = [
  {
    "id": 1,
    "uid": "harry",
    "display_name": "Harshit Singh",
    "directory_id": 1,
    "created_at": "2024-09-13T06:04:30.01Z"
  },
  {
    "id": 2,
    "uid": "carry",
    "display_name": "Cartel Singh",
    "directory_id": 1,
    "created_at": "2024-09-13T06:16:52.5766667Z",
    "updated_at": "2024-09-13T06:17:18.2233333Z"
  },
  {
    "id": 3,
    "uid": "sri",
    "display_name": "Sri Singh",
    "directory_id": 1,
    "created_at": "2024-09-13T06:19:45.9466667Z"
  },
  {
    "id": 4,
    "uid": "sashi",
    "display_name": "Sashi Singh",
    "directory_id": 1,
    "created_at": "2024-09-13T06:19:45.9466667Z"
  }
];

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(userData[0]);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    createConversation();
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createConversation = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/conversations`, {
        members: userData.map(user => user.uid)
      }, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });
      setConversationId(response.data.id);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/apps/${conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });
      setMessages(response.data.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/apps/${conversationId}/messages`, {
        text: newMessage
      }, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="chat-app" style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Chat Application</h1>
      <div className="messages" style={{ height: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
        {messages.map((message) => (
          <div 
            key={message.id} 
            style={{
              marginBottom: '10px',
              textAlign: message.created_by.id === currentUser.id ? 'right' : 'left'
            }}
          >
            <div 
              style={{
                background: message.created_by.id === currentUser.id ? '#007bff' : '#f1f0f0',
                color: message.created_by.id === currentUser.id ? 'white' : 'black',
                borderRadius: '20px',
                padding: '10px 15px',
                display: 'inline-block',
                maxWidth: '70%'
              }}
            >
              <p style={{ margin: '0 0 5px 0' }}>{message.text}</p>
              <small style={{ fontSize: '0.8em', opacity: 0.7 }}>
                {formatDate(message.created_at)} - {message.created_by.display_name}
              </small>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '10px', fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', background: '#007bff', color: 'white', border: 'none' }}>Send</button>
      </form>
      <div style={{ marginTop: '20px' }}>
        <h3>Change Current User:</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {userData.map(user => (
            <button 
              key={user.id} 
              onClick={() => setCurrentUser(user)}
              style={{ 
                padding: '5px 10px', 
                background: currentUser.id === user.id ? '#007bff' : '#f1f0f0',
                color: currentUser.id === user.id ? 'white' : 'black'
              }}
            >
              {user.display_name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatApp;