import React, { useState, useRef, useEffect } from 'react';
import './ChatModal.css';

const INITIAL_CHAT_ROOMS = [
  {
    id: 1,
    productTitle: '코스트코 키친타올 12롤',
    partnerName: '성북구자취생',
    lastMessage: '네! 내일 저녁 7시에 성북구청 앞에서 뵐게요 😊',
    updatedAt: '오후 4:32',
    unreadCount: 2,
    status: '모집중',
  },
  {
    id: 2,
    productTitle: '신라면 멀티팩 20봉',
    partnerName: '라면러버',
    lastMessage: '혹시 아직 자리 남았나요?',
    updatedAt: '어제',
    unreadCount: 0,
    status: '모집완료',
  },
  {
    id: 3,
    productTitle: '물티슈 캡형 10팩',
    partnerName: '깔끔대장',
    lastMessage: '입금 확인했습니다! 내일 뵙겠습니다.',
    updatedAt: '11월 10일',
    unreadCount: 0,
    status: '거래완료',
  },
];

const INITIAL_MESSAGES = {
  1: [
    { id: 101, sender: 'me', text: '안녕하세요! 키친타올 공구 참여하고 싶어서 연락드렸어요.', time: '오후 4:20' },
    { id: 102, sender: 'partner', text: '안녕하세요~ 네 가능해요! 6롤씩 나누면 8,500원입니다.', time: '오후 4:25' },
    { id: 103, sender: 'me', text: '좋아요! 내일 저녁 7시쯤 직거래 가능하실까요?', time: '오후 4:30' },
    { id: 104, sender: 'partner', text: '네! 내일 저녁 7시에 성북구청 앞에서 뵐게요 😊', time: '오후 4:32' },
  ],
  2: [
    { id: 201, sender: 'partner', text: '혹시 아직 자리 남았나요?', time: '오후 2:10' },
  ],
  3: [
    { id: 301, sender: 'partner', text: '입금 확인했습니다! 내일 뵙겠습니다.', time: '오전 11:05' },
  ],
};

export default function ChatModal({ isOpen, onClose, initialRoom = null }) {
  const [selectedRoom, setSelectedRoom] = useState(initialRoom);
  const [chatRooms, setChatRooms] = useState(INITIAL_CHAT_ROOMS);
  const [messagesMap, setMessagesMap] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setSelectedRoom(initialRoom);
  }, [initialRoom, isOpen]);

  useEffect(() => {
    if (selectedRoom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedRoom, messagesMap]);

  if (!isOpen) return null;

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setChatRooms((prev) =>
      prev.map((item) => (item.id === room.id ? { ...item, unreadCount: 0 } : item))
    );
  };

  const handleBackToList = () => {
    setSelectedRoom(null);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedRoom) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: inputText.trim(),
      time: timeString,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedRoom.id]: [...(prev[selectedRoom.id] || []), newMessage],
    }));

    setChatRooms((prev) =>
      prev.map((room) =>
        room.id === selectedRoom.id
          ? { ...room, lastMessage: inputText.trim(), updatedAt: timeString }
          : room
      )
    );

    setInputText('');
  };

  const currentMessages = selectedRoom ? messagesMap[selectedRoom.id] || [] : [];

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="chat-modal-header">
          {selectedRoom ? (
            <div className="chat-header-room-info">
              <button
                type="button"
                className="chat-back-btn"
                onClick={handleBackToList}
                aria-label="목록으로 돌아가기"
              >
                ←
              </button>
              <div className="chat-header-titles">
                <h3 className="chat-partner-name">{selectedRoom.productTitle}</h3>
                <span className="chat-product-subtitle">{selectedRoom.partnerName}</span>
              </div>
            </div>
          ) : (
            <h2 className="chat-modal-title">공구 채팅</h2>
          )}

          <button
            type="button"
            className="chat-close-btn"
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {!selectedRoom ? (
          <div className="chat-room-list">
            {chatRooms.length === 0 ? (
              <div className="chat-empty-state">
                <p>진행 중인 공구 채팅이 없어요 🛒</p>
                <span>관심 있는 공동구매에 참여해 대화를 시작해보세요!</span>
              </div>
            ) : (
              chatRooms.map((room) => (
                <div
                  key={room.id}
                  className="chat-room-item"
                  onClick={() => handleSelectRoom(room)}
                >
                  <div className="chat-avatar">
                    {room.partnerName.slice(0, 1)}
                  </div>
                  <div className="chat-room-content">
                    <div className="chat-room-top">
                      <span className="chat-room-partner">{room.productTitle}</span>
                      <span className={`chat-status-badge ${room.status === '모집중' ? 'active' : 'done'}`}>
                        {room.status}
                      </span>
                      <span className="chat-room-time">{room.updatedAt}</span>
                    </div>
                    <div className="chat-room-product">{room.partnerName}</div>
                    <div className="chat-room-bottom">
                      <p className="chat-room-last-msg">{room.lastMessage}</p>
                      {room.unreadCount > 0 && (
                        <span className="chat-unread-badge">{room.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="chat-room-view">
            <div className="chat-product-banner">
              <span className="banner-tag">{selectedRoom.status}</span>
              <span className="banner-title">{selectedRoom.productTitle}</span>
            </div>

            <div className="chat-messages-area">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message-row ${msg.sender === 'me' ? 'mine' : 'theirs'}`}
                >
                  {msg.sender === 'me' && (
                    <span className="chat-msg-time">{msg.time}</span>
                  )}
                  <div className="chat-bubble">{msg.text}</div>
                  {msg.sender !== 'me' && (
                    <span className="chat-msg-time">{msg.time}</span>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="chat-input-field"
                placeholder="메시지를 입력하세요..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={!inputText.trim()}
              >
                전송
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}