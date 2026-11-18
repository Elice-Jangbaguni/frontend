import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCamera, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import './ReceiptOCRModal.css';

// 임시 소비기한 기준 남은 일수 계산
const getRemainingDays = (productDate) => {
  if (!productDate) return null;
  const today = new Date();
  const [year, month, day] = productDate.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);

  today.setHours(0, 0, 0, 0);
  const diff = targetDate - today;
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

export default function ReceiptOCRModal({ initialData, onClose }) {
// 서버에서 받은 items 배열의 '마지막 항목'을 무조건 제외하고 상태 초기화
  const [items, setItems] = useState(() => {
    let rawItems = [];
    if (!initialData) return [];
    if (Array.isArray(initialData.items)) rawItems = initialData.items;
    else if (Array.isArray(initialData)) rawItems = initialData;

    // 마지막 항목(총구 매액 등)을 제외하고 반환
    return rawItems.slice(0, -1);
  });
    
  const [scannedIds, setScannedIds] = useState([]);
  const [message, setMessage] = useState('');

  const foodCount = items.filter((item) => item.category === '식료품').length;
  const dailyCount = items.filter((item) => item.category === '생필품').length;

  // 개별 품목 소비기한 OCR 테스트 반영
  const handleCameraClick = (productId) => {
    setItems((prev) =>
      prev.map((item, index) =>
        (item.product_id || index) === productId
          ? { ...item, product_date: item.ocr_date || item.product_date }
          : item
      )
    );

    setScannedIds((prev) =>
      prev.includes(productId) ? prev : [...prev, productId]
    );

    setMessage('');
  };

  // 인식 품목 등록 핸들러
  const handleRegister = () => {
    const registerData = items.map((item) => ({
      product_name: item.product_name,
      category: item.category,
      product_date: item.product_date,
    }));

    console.log('등록할 상품:', registerData);
    setMessage('등록되었습니다.');
  };

  const hasScanned = scannedIds.length > 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container ocr-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-ocr-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 헤더 */}
        <div className="modal-header">
          {/* 상단 인식 결과 배지 */}
          <div className="receipt-ocr-result">
            인식 완료 : 식료품 {foodCount}개, 생필품 {dailyCount}개
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="닫기"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="modal-body ocr-modal-body">
          {/* 상단 아이콘 및 안내 문구 */}
          <div className="receipt-ocr-heading">
            <div className="receipt-ocr-calendar-badge">
              <FontAwesomeIcon icon={faCalendarCheck} />
            </div>

            <h2 id="receipt-ocr-title">
              소비기한을 자동으로 채워드릴까요?
            </h2>

            <p>
              카테고리별 <strong>평균 소비기한</strong>으로 임시 설정할 수 있어요.
              <br />
              실제 소비기한을 정확히 등록하려면 카메라로 찍어주세요!
            </p>
          </div>

          {/* 인식된 상품 목록 */}
          <div className="receipt-ocr-list">
            {items.length === 0 ? (
              <p className="receipt-ocr-empty">
                인식된 상품이 없습니다.
              </p>
            ) : (
              items.map((item, index) => {
                const itemId = item.product_id || index;
                const isScanned = scannedIds.includes(itemId);
                const remainingDays = item.product_date
                  ? getRemainingDays(item.product_date)
                  : null;

                let dateLabel;
                if (item.category === '식료품') {
                  if (isScanned || item.product_date) {
                    dateLabel = item.product_date ? item.product_date.replaceAll('-', '.') : '기한 미설정';
                  } else {
                    dateLabel = `임시 ${remainingDays > 0 ? '+' : ''}${remainingDays || 0}일`;
                  }
                } else {
                  if (remainingDays === null) {
                    dateLabel = item.product_date ? item.product_date.replaceAll('-', '.') : '예측 불가';
                  } else {
                    dateLabel = `예측 ${remainingDays > 0 ? '+' : ''}${remainingDays}일`;
                  }
                }

                return (
                  <div className="receipt-ocr-item" key={itemId}>
                    <div className="receipt-ocr-item-info">
                      <span className="receipt-ocr-product-name">
                        {item.product_name}
                      </span>

                      {/* {item.category === '식료품' && ( */}
                        <button
                          type="button"
                          className="receipt-ocr-camera"
                          onClick={() => handleCameraClick(itemId)}
                          aria-label={`${item.product_name} 소비기한 인식`}
                          title="소비기한 OCR 테스트"
                        >
                          <FontAwesomeIcon icon={faCamera} />
                        </button>
                      {/* )} */}
                    </div>
                    <span className="receipt-ocr-date">{dateLabel}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* 등록 완료 안내 메시지 */}
          {message && (
            <p className="receipt-ocr-message" role="status">
              {message}
            </p>
          )}
        </div>

        {/* 하단 푸터 */}
        <div className="modal-footer">
          <button
            type="button"
            className="modal-confirm-btn"
            onClick={handleRegister}
            disabled={items.length === 0}
          >
            {hasScanned ? '등록하기' : '네, 임시 기한 적용'}
          </button>
        </div>
      </div>
    </div>
  );
}