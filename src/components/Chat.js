import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useRef } from 'react';
import "../styles/Chat.css";

const Chat = ({ repoId, user, repoOwner }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false); // Modal state
  const [email, setEmail] = useState('');
  const socket = useRef(null); 
  const [isMember, setIsMember] = useState(false); 
  const isOwner = user?._id && String(user._id) === String(repoOwner);
  
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    // Verify user data
    if (user?._id) {
      console.log("User data verified:", user);
      setUserLoaded(true);
    }
  }, [user]);


  useEffect(() => {
    const checkMembership = async () => {
      try {
        const res = await axios.get(`/api/repos/${repoId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const members = res.data.members.map((member) => String(member._id));
        setIsMember(members.includes(String(user._id)) || isOwner);
      } catch (error) {
        console.error("Failed to check membership:", error);
      } finally {
        setLoading(false);
      }
    };

    checkMembership();
  }, [repoId, user, isOwner]);

  

  useEffect(() => {
    // Fetch message history
    const fetchMessages = async () => {
        try {
            const res = await axios.get(`/api/messages/${repoId}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
          
            if (res.data && Array.isArray(res.data)) {
              setMessages(res.data);
            } else {
              console.warn("No messages found for this repository.");
              setMessages([]); // Ensure messages state is set to an empty array
            }
          } catch (error) {
            if (error.response && error.response.status === 404) {
              console.warn("No messages exist initially.");
              setMessages([]); // Handle the case where no messages exist yet
            } else {
              console.error("Failed to fetch messages:", error.message || error);
            }
          } 
    };

    // Setup WebSocket
    socket.current = io('http://localhost:5000');
    socket.current.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    fetchMessages();
  }, [repoId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const message = {
      content: newMessage,
      sender: user._id,
      repository: repoId,
    };

    socket.current.emit('send-message', message);
    setNewMessage('');
  };

  const handleInvite = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/invite',
        { repoId, email, role: 'member' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Invitation sent!');
      setShowInviteModal(false); // Close modal after sending invite
    } catch (error) {
      console.error('Failed to send invitation:', error);
    }
  };
  if (!userLoaded) return <div>Loading user data...</div>;
  if (!isMember) {
    return <div>You do not have access to this repository's chat.</div>;
  }

  return (
    <div className="chat-panel">
      <div className="message-list">
      {messages.length > 0 ? (
        messages.map(msg => (
          <div key={msg._id} className="message">
            <span className="sender">{msg.sender.username}</span>
            <p>{msg.content}</p>
          </div>
       ))
      ) : (
        <p className="no-messages">No messages yet. Start the conversation!</p>
      )}

      </div>
      <div className="message-input">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      {/* Show Add Member button only if the current user is the repository owner */}
      {isOwner && (
        <button onClick={() => setShowInviteModal(true)} className="invite-btn">
          + Add Member
        </button>
      )}

      {/* Invite Form Modal */}
      {showInviteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Invite a Member</h3>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleInvite}>Send Invite</button>
            <button onClick={() => setShowInviteModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Chat;