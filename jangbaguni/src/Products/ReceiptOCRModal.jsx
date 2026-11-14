
import React, { useState } from 'react';
import { X, Camera } from 'lucide-react';
import calendarImage from './receipt-calendar.png';
import './ReceiptOCRModal.css';

// 영수증 OCR 결과 테스트용 데이터(ocr_date는 소비기한 ocr 테스트용 데이터)
const sampleProducts = [
  {
    product_id: 1,
    product_name: '매일우유 저지방 900ml',
    category: '식료품',
    product_date: '2026-11-20',
    ocr_date: '2026-11-18',
  },
  {
    product_id: 2,
    product_name: '물티슈',
    category: '생필품',
    product_date: '2027-01-01'
  },

  {
    product_id: 3,
    product_name: '샴푸',
    category: '생필품',
    product_date: null,
  },
];

/* 임시 소비기한 기준으로 남은 일수 계산 */
const getRemainingDays = (productDate) => {
  const today = new Date();
  const [year, month, day] = productDate.split('-').map(Number);

  const targetDate = new Date(year, month - 1, day);

  today.setHours(0, 0, 0, 0);

  const diff = targetDate - today;

  return Math.round(diff / (1000 * 60 * 60 * 24));
};

export default function ReceiptOCRModal({ onClose }) {
  const [items, setItems] = useState(sampleProducts);
  const [scannedIds, setScannedIds] = useState([]);
  const [message, setMessage] = useState('');

  const foodCount = items.filter(
    (item) => item.category === '식료품'
  ).length;

  const dailyCount = items.filter(
    (item) => item.category === '생필품'
  ).length;

  // 소비기한 OCR 결과를 더미 데이터로 반영
  const handleCameraClick = (productId) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { ...item, product_date: item.ocr_date }
          : item
      )
    );

    setScannedIds((prev) =>
      prev.includes(productId)
        ? prev
        : [...prev, productId]
    );

    setMessage('');
  };

  /*상품 등록 테스트 */

  const handleRegister = () => {
    // 실제 상품 등록 API는 추후 연결
    const registerData = items.map((item) => ({
      product_name: item.product_name,
      category: item.category,
      product_date: item.product_date,
    }));

    console.log('등록할 상품:', registerData);

    setMessage(
      '등록되었습니다.'
    );
  };

  /* 한 상품이라도 소비기한 ocr을 수행했는지 확인(아래 버튼 문구를 '등록하기'로 바꾸기 위해) */
  const hasScanned = scannedIds.length > 0;

  return (
    <div className="receipt-ocr-overlay">
      <div
        className="receipt-ocr-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-ocr-title"
      >
        {/* 닫기 */}
        <button
          type="button"
          className="receipt-ocr-close"
          onClick={onClose}
          aria-label="모달 닫기"
        >
          <X size={34} />
        </button>

        {/* 인식 완료 안내 */}
        <div className="receipt-ocr-result">
          인식 완료 : 식료품 {foodCount}개, 생필품 {dailyCount}개
        </div>

        <hr className="receipt-ocr-divider" />

        {/* 안내 문구 */}
        <div className="receipt-ocr-heading">
          <img
            src={calendarImage}
            alt="소비기한 안내"
            className="receipt-ocr-calendar"
          />

          <h2 id="receipt-ocr-title">
            소비기한을 자동으로 채워드릴까요?
          </h2>

          <p>
            카테고리별 <strong>평균 소비기한</strong>을 기준으로
            임시 설정할 수 있어요.
            <br />
            실제 소비기한을 정확히 등록하려면 카메라로 찍어주세요!
          </p>
        </div>

        {/* 상품 목록 */}
        <div className="receipt-ocr-list">
          {items.length === 0 ? (
            <p className="receipt-ocr-empty">
              인식된 상품이 없습니다.
            </p>
          ) : (
            
                items.map((item) => {

                  const isScanned = scannedIds.includes(item.product_id);

                  const remainingDays = item.product_date
                    ? getRemainingDays(item.product_date)
                    : null;

                  let dateLabel;

                  if (item.category === '식료품') {
                    if (isScanned) {
                      dateLabel = item.product_date.replaceAll('-', '.');
                    } else {
                      dateLabel = `임시 ${remainingDays > 0 ? '+' : ''}${remainingDays}일`;
                    }
                  } else {
                    if (remainingDays === null) {
                      dateLabel = '예측 불가';
                    } else {
                      dateLabel = `예측 ${remainingDays > 0 ? '+' : ''}${remainingDays}일`;
                    }
                  }


                  return (
                <div
                  className="receipt-ocr-item"
                  key={item.product_id}
                >
                  <div className="receipt-ocr-item-info">
                    <span className="receipt-ocr-product-name">
                      {item.product_name}
                    </span>

                    {/* 식료품에만 카메라 버튼 표시 */}
                    {item.category === '식료품' && (
                      <button
                        type="button"
                        className="receipt-ocr-camera"
                        onClick={() => handleCameraClick(item.product_id)}
                        aria-label={`${item.product_name} 소비기한 인식`}
                        title="소비기한 OCR 테스트"
                      >
                        <Camera size={19} />
                      </button>
                    )}
                  </div>
                    <span className="receipt-ocr-date">
                      {dateLabel}
                    </span>
                </div>
              );
            })
          )}
        </div>

        {/* 하단 버튼 */}
        <button
          type="button"
          className="receipt-ocr-register"
          onClick={handleRegister}
          disabled={items.length === 0}
        >
          {hasScanned ? '등록하기' : '네, 임시 기한 적용'}
        </button>

        {message && (
          <p className="receipt-ocr-message" role="status">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

