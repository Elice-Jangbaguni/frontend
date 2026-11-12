import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots } from '@fortawesome/free-solid-svg-icons';
import './ChatFloatingButton.css';

export default function ChatFloatingButton({ onClick, unreadCount = 0 }) {
  return (
    <button
      type="button"
      className="chat-floating-btn"
      onClick={onClick}
      aria-label="공구 채팅 열기"
    >
      <FontAwesomeIcon icon={faCommentDots} className="chat-floating-icon" />
      {unreadCount > 0 && (
        <span className="chat-floating-badge">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}