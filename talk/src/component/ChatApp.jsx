import React, { useState, useEffect } from 'react';

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
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConversations();
    setCurrentUser(userData[0]);
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data.data)) {
        setConversations(data.data);
      } else {
        console.warn('Unexpected data structure:', data);
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to fetch conversations. Please try again later.');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async () => {
    const otherUser = userData.find(user => user.id !== currentUser.id);
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          members: [currentUser.uid, otherUser.uid],
          name: `Chat between ${currentUser.display_name} and ${otherUser.display_name}`,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setConversations(prevConversations => [...prevConversations, data]);
      alert('Conversation created successfully');
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation');
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const fetchMessages = async (conversationId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data.data)) {
        setMessages(data.data);
      } else {
        console.warn('Unexpected message data structure:', data);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to fetch messages. Please try again later.');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newMessage,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessages(prevMessages => [...prevMessages, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const switchUser = () => {
    const nextUserIndex = (userData.findIndex(user => user.id === currentUser.id) + 1) % userData.length;
    setCurrentUser(userData[nextUserIndex]);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.heading}>Conversations</h2>
        <button onClick={createConversation} style={styles.button}>Create New Conversation</button>
        <button onClick={switchUser} style={{...styles.button, marginLeft: '10px'}}>Switch User</button>
        <p style={styles.currentUser}>Current User: {currentUser?.display_name}</p>
        {conversations.length > 0 ? (
          <ul style={styles.list}>
            {conversations.map((item) => (
              <li
                key={item.id}
                onClick={() => selectConversation(item)}
                style={{
                  ...styles.listItem,
                  backgroundColor: selectedConversation?.id === item.id ? '#e6f7ff' : 'transparent',
                }}
              >
                {item.name || `Conversation ${item.id}`}
              </li>
            ))}
          </ul>
        ) : (
          <p>No conversations available.</p>
        )}
      </div>
      <div style={styles.chatArea}>
        <h2 style={styles.heading}>
          {selectedConversation ? (selectedConversation.name || `Conversation ${selectedConversation.id}`) : 'Select a conversation'}
        </h2>
        {selectedConversation ? (
          <>
            <div style={styles.messageList}>
              {messages.length > 0 ? (
                messages.map((item) => (
                  <div key={item.id} style={styles.message}>
                    <strong>{userData.find(user => user.uid === item.user?.uid)?.display_name || 'Unknown User'}</strong>: {item.text}
                  </div>
                ))
              ) : (
                <p>No messages in this conversation.</p>
              )}
            </div>
            <div style={styles.inputArea}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                style={styles.input}
              />
              <button onClick={sendMessage} style={styles.button}>Send</button>
            </div>
          </>
        ) : (
          <p>Select a conversation to start chatting.</p>
        )}
      </div>
    </div>
  );
}
const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  sidebar: {
    width: '30%',
    padding: '20px',
    borderRight: '1px solid #ccc',
    backgroundColor: '#f0f0f0',
  },
  chatArea: {
    width: '70%',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  heading: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  button: {
    backgroundColor: '#1890ff',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    cursor: 'pointer',
    marginBottom: '15px',
    borderRadius: '4px',
  },
  currentUser: {
    marginBottom: '15px',
    fontWeight: 'bold',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    padding: '10px',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  messageList: {
    flexGrow: 1,
    overflowY: 'auto',
    marginBottom: '15px',
  },
  message: {
    marginBottom: '10px',
  },
  inputArea: {
    display: 'flex',
  },
  input: {
    flexGrow: 1,
    marginRight: '10px',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
};

export default ChatApp;