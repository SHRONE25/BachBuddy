import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getConversations, getMessages, sendMessage } from '../services/api';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const loadConversations = () => {
    getConversations().then((res) => {
      setConversations(res.data);
      if (!activeId && res.data.length) setActiveId(res.data[0]._id);
    });
  };

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (!activeId) return;
    getMessages(activeId).then((res) => setMessages(res.data));
  }, [activeId]);

  const otherParticipant = (conv) => conv.participants.find((p) => p._id !== user._id);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    await sendMessage(activeId, text);
    setText('');
    const res = await getMessages(activeId);
    setMessages(res.data);
    loadConversations();
  };

  return (
    <div className="messages-page">
      <div className="conversations-list">
        <h3>Messages</h3>
        {conversations.length === 0 && <p className="empty-state">No conversations yet.</p>}
        {conversations.map((conv) => {
          const other = otherParticipant(conv);
          return (
            <div
              key={conv._id}
              className={`conversation-item ${activeId === conv._id ? 'active' : ''}`}
              onClick={() => setActiveId(conv._id)}
            >
              <strong>{other?.name || 'User'}</strong>
              {conv.property && <span className="conversation-property">{conv.property.title}</span>}
              <p>{conv.lastMessage}</p>
            </div>
          );
        })}
      </div>

      <div className="conversation-thread">
        {activeId ? (
          <>
            <div className="thread-messages">
              {messages.map((m) => (
                <div key={m._id} className={`thread-bubble ${m.sender._id === user._id ? 'own' : ''}`}>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>
            <form className="thread-input" onSubmit={handleSend}>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." />
              <button className="btn btn-primary" type="submit">Send</button>
            </form>
          </>
        ) : (
          <p className="empty-state">Select a conversation to start chatting.</p>
        )}
      </div>
    </div>
  );
};

export default Messages;
