import React from 'react';

export default function AlertModal({
  open,
  title = '알림',
  message,
  confirmText = '확인',
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onConfirm?.();
        }
      }}
    >
      <div
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="common-alert-title"
        style={{ maxWidth: '380px' }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-header"
          style={{ borderBottom: 'none', paddingBottom: '8px' }}
        >
          <h3 id="common-alert-title">{title}</h3>
        </div>

        <div
          className="modal-body"
          style={{ paddingTop: '8px', paddingBottom: '20px' }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '17px',
              fontWeight: 500,
              lineHeight: 1.55,
              color: '#121212',
            }}
          >
            {message}
          </p>
        </div>

        <div
          className="modal-footer"
          style={{ borderTop: 'none', paddingTop: '4px' }}
        >
          <button
            type="button"
            className="modal-confirm-btn"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}