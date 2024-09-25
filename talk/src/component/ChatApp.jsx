import React, { useState, useEffect } from 'react';
import './ChatApp.css';

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
  const [conversations, setConversations] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [chatName, setChatName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUser = userData.find(user => user.uid === 'sri');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      console.log('API Response:', data);
      setConversations(data.data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Error fetching conversations: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    if (user.uid !== currentUser.uid) {
      setSelectedUsers(prev => 
        prev.includes(user) 
          ? prev.filter(u => u !== user) 
          : [...prev, user]
      );
    }
  };

  const createConversation = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select at least one user to start a conversation.");
      return;
    }

    const members = [currentUser.uid, ...selectedUsers.map(user => user.uid)];
    const name = chatName.trim() || null;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ members, name })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create conversation');
      }
      const newConversation = await response.json();
      console.log('New Conversation:', newConversation);
      setConversations(prev => [...prev, newConversation]);
      setSelectedUsers([]);
      setChatName('');
      alert('Conversation created successfully!');
      fetchConversations(); // Refresh the conversation list
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Error creating conversation: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-app">
      <h1>Chat App (Logged in as {currentUser.display_name})</h1>
      {error && <div className="error">{error}</div>}
      <div className="create-conversation">
        <h2>Create New Conversation</h2>
        <input
          type="text"
          placeholder="Chat name (optional)"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
          disabled={isLoading}
        />
        <div className="user-list">
          {userData.map(user => (
            <div
              key={user.id}
              className={`user-item ${selectedUsers.includes(user) ? 'selected' : ''} ${user.uid === currentUser.uid ? 'current-user' : ''}`}
              onClick={() => handleUserSelect(user)}
            >
              {user.display_name}
            </div>
          ))}
        </div>
        <button onClick={createConversation} disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Conversation'}
        </button>
      </div>
      <div className="conversation-list">
        <h2>Your Conversations</h2>
        {isLoading ? (
          <p>Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <p>No conversations yet.</p>
        ) : (
          <ul>
            {conversations.map(conv => (
              <li key={conv.id}>
                {conv.name || `Conversation ${conv.id}`}
                {conv.members && conv.members.data && (
                  <span> with {conv.members.data.map(m => m.display_name).join(', ')}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatApp;