import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { getMyGroupBuyList } from '../API/groupbuy';
import './ChatModal.css';

// 날짜 값을 YYYY-MM-DD 형식으로 정규화
const formatDateOnly = (value) => {
  if (!value) return '';
  const str = String(value).trim();
  const match = str.match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];

  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return str.slice(0, 10);

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 방 인덱스별 임시 메시지 생성
const buildSeedMessagesForRooms = (rooms) => {
  const nextMessages = {};

  if (rooms[0]) {
    nextMessages[rooms[0].id] = [
      {
        id: `${rooms[0].id}-seed-1`,
        sender: 'me',
        text: '안녕하세요 공구 원합니다!',
        time: '오후 3:10',
      },
    ];
  }

  if (rooms[1]) {
    nextMessages[rooms[1].id] = [
      {
        id: `${rooms[1].id}-seed-1`,
        sender: 'me',
        text: '안녕하세요 공구 원합니다!',
        time: '오후 2:05',
      },
      {
        id: `${rooms[1].id}-seed-2`,
        sender: 'partner',
        text: '네 가능합니다',
        time: '오후 2:12',
      },
    ];
  }

  return nextMessages;
};

// API 응답 항목을 채팅방 목록 형태로 정규화
const normalizeGroupBuyToRoom = (item, index = 0) => {
  const roomId = item.buy_id ?? item.id;
  const productTitle = item.product_name ?? item.title ?? `공구 #${roomId}`;
  const partnerName =
    item.partner_name ??
    item.seller_name ??
    item.writer_name ??
    item.nickname ??
    item.username ??
    item.place ??
    '참여자';

  const currentPeople = Number(item.current_people ?? item.participants_count ?? 0);
  const maxPeople = Number(item.number_of_people ?? item.max_people ?? 0);
  const rawStatus = item.status;

  let statusLabel = '모집중';
  if (rawStatus === '거래완료' || rawStatus === 'COMPLETED') {
    statusLabel = '거래완료';
  } else if (
    rawStatus === '모집완료' ||
    rawStatus === 'CLOSED' ||
    (maxPeople > 0 && currentPeople >= maxPeople)
  ) {
    statusLabel = '모집완료';
  }

  const rawDate =
    item.updated_at ?? item.updatedAt ?? item.uploaded_date ?? item.created_at ?? '';

  let seedLastMessage = item.last_message ?? item.lastMessage ?? '';
  if (!seedLastMessage) {
    if (index === 0) seedLastMessage = '안녕하세요 공구 원합니다!';
    else if (index === 1) seedLastMessage = '네 가능합니다';
  }

  return {
    id: roomId,
    buyId: roomId,
    productTitle,
    partnerName,
    lastMessage: seedLastMessage,
    updatedAt: formatDateOnly(rawDate),
    unreadCount: Number(item.unread_count ?? item.unreadCount ?? 0),
    status: statusLabel,
  };
};

export default function ChatModal({ isOpen, onClose, initialRoom = null }) {
  const [selectedRoom, setSelectedRoom] = useState(
    initialRoom ? normalizeGroupBuyToRoom(initialRoom) : null
  );
  const [chatRooms, setChatRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState('');
  const [messagesMap, setMessagesMap] = useState({});
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // 초기 진입 채팅방 동기화
  useEffect(() => {
    setSelectedRoom(initialRoom ? normalizeGroupBuyToRoom(initialRoom) : null);
  }, [initialRoom, isOpen]);

  // 채팅 모달 열릴 때 내 참여 공구 목록 조회
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadMyRooms = async () => {
      try {
        setLoadingRooms(true);
        setRoomsError('');

        const data = await getMyGroupBuyList();
        const rawList = Array.isArray(data)
          ? data
          : data?.posts || data?.items || data?.group_buys || data?.participants || data?.rooms || [];

        const normalizedRooms = rawList.map((item, index) =>
          normalizeGroupBuyToRoom(item, index)
        );
        const seedMessages = buildSeedMessagesForRooms(normalizedRooms);

        if (isMounted) {
          setChatRooms(normalizedRooms);
          setMessagesMap((prev) => ({
            ...seedMessages,
            ...prev,
          }));
        }
      } catch (error) {
        if (isMounted) {
          setRoomsError('참여 중인 공구 목록을 불러오지 못했습니다.');
          setChatRooms([]);
        }
      } finally {
        if (isMounted) {
          setLoadingRooms(false);
        }
      }
    };

    loadMyRooms();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // 새 메시지 수신 시 스크롤 하단 고정
  useEffect(() => {
    if (selectedRoom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedRoom, messagesMap]);

  if (!isOpen) return null;

  // 채팅방 입장 및 읽음 처리
  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setChatRooms((prev) =>
      prev.map((item) => (item.id === room.id ? { ...item, unreadCount: 0 } : item))
    );
  };

  // 채팅방 목록으로 뒤로가기
  const handleBackToList = () => {
    setSelectedRoom(null);
  };

  // 메시지 전송 핸들러
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedRoom) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const todayDateString = formatDateOnly(now.toISOString());

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
          ? { ...room, lastMessage: inputText.trim(), updatedAt: todayDateString }
          : room
      )
    );

    setInputText('');
  };

  const currentMessages = selectedRoom ? messagesMap[selectedRoom.id] || [] : [];

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* 모달 상단 헤더 */}
        <div className="chat-modal-header">
          {selectedRoom ? (
            <div className="chat-header-room-info">
              <button
                type="button"
                className="chat-back-btn"
                onClick={handleBackToList}
                aria-label="목록으로 돌아가기"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
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
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* 채팅방 목록 뷰 */}
        {!selectedRoom ? (
          <div className="chat-room-list">
            {loadingRooms ? (
              <div className="chat-empty-state">
                <p>참여 중인 공구 목록을 불러오는 중입니다...</p>
              </div>
            ) : roomsError ? (
              <div className="chat-empty-state">
                <p>{roomsError}</p>
              </div>
            ) : chatRooms.length === 0 ? (
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
                    {(room.partnerName || '공').slice(0, 1)}
                  </div>
                  <div className="chat-room-content">
                    <div className="chat-room-top">
                      <span className="chat-room-partner">{room.productTitle}</span>
                      <span className={`chat-status-badge ${room.status === '모집중' ? 'active' : 'done'}`}>
                        {room.status}
                      </span>
                      {room.updatedAt && (
                        <span className="chat-room-time">{room.updatedAt}</span>
                      )}
                    </div>
                    <div className="chat-room-product">{room.partnerName}</div>
                    <div className="chat-room-bottom">
                      {room.lastMessage && (
                        <p className="chat-room-last-msg">{room.lastMessage}</p>
                      )}
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
          /* 채팅방 상세 대화 뷰 */
          <div className="chat-room-view">
            {/* 상단 공구 상품 정보 배너 */}
            <div className="chat-product-banner">
              <span className="banner-tag">{selectedRoom.status}</span>
              <span className="banner-title">{selectedRoom.productTitle}</span>
            </div>

            {/* 메시지 내역 영역 */}
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

            {/* 하단 메시지 입력 폼 */}
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