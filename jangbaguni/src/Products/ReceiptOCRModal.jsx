import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCamera, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import { scanProductDate } from '../API/receipt';
import { registerProducts } from '../API/products';
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

const isFoodCategory = (category) => category === '식료품' || category === 'food';

const isDailyCategory = (category) => category === '생필품' || category === 'daily';

export default function ReceiptOCRModal({ initialData, receiptId, onClose, onSuccess }) {
  // 서버에서 받은 items 배열로 상태 초기화
  const [items, setItems] = useState(() => {
    let rawItems = [];
    if (!initialData) return [];
    if (Array.isArray(initialData.items)) rawItems = initialData.items;
    else if (Array.isArray(initialData)) rawItems = initialData;

    return rawItems;
  });

  const [scannedIds, setScannedIds] = useState([]);
  const [message, setMessage] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const fileInputRef = useRef(null);
  const targetProductIdRef = useRef(null);

  const foodCount = items.filter((item) => isFoodCategory(item.category)).length;
  const dailyCount = items.filter((item) => isDailyCategory(item.category)).length;

  const getItemKey = (item, index) =>
    item.ocritem_id ?? item.ocr_item_id ?? item.product_id ?? item.id ?? index;

  // 1. 카메라 버튼 클릭 시: 대상 상품 ID 저장 후 숨겨진 file input 오픈
  const handleCameraClick = (e, itemId) => {
    e.stopPropagation();
    targetProductIdRef.current = itemId;
    fileInputRef.current?.click();
  };

  // 2. 사진 선택 시: POST /api/products/product_date_ocr API 호출하여 소비기한 OCR 수행
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    const targetId = targetProductIdRef.current;
    if (!file || targetId === null || targetId === undefined) return;

    try {
      setUploadingId(targetId);
      setMessage('소비기한을 인식 중입니다...');

      const response = await scanProductDate(file);
      console.log('상품 날짜 OCR 응답:', response);

      const detectedDate =
        typeof response === 'string'
          ? response
          : response?.date || response?.product_date || response?.data?.product_date || response?.data?.date;

      if (detectedDate) {
        setItems((prev) =>
          prev.map((item, index) => {
            const itemId = getItemKey(item, index);
            return itemId === targetId ? { ...item, product_date: detectedDate } : item;
          })
        );

        setScannedIds((prev) => (prev.includes(targetId) ? prev : [...prev, targetId]));
        setMessage('소비기한이 성공적으로 인식되었습니다.');
      } else {
        alert('날짜를 인식하지 못했습니다. 다시 촬영해 주세요.');
      }
    } catch (error) {
      console.error('상품 날짜 OCR 오류:', error);
      alert('날짜 인식 중 오류가 발생했습니다.');
    } finally {
      setUploadingId(null);
      e.target.value = '';
      targetProductIdRef.current = null;
    }
  };

  // 인식 품목 일괄 등록 핸들러 (POST /api/products)
  const handleRegister = async () => {
    if (isRegistering) return;

    const resolvedReceiptId = Number(
      receiptId ?? initialData?.receipt_id ?? items[0]?.receipt_id ?? 0
    );

    const payload = {
      receipt_id: resolvedReceiptId,
      products: items.map((item, index) => {
        const itemId = getItemKey(item, index);
        const isScanned = scannedIds.includes(itemId);

        // 식료품: OCR 실행 시 인식된 날짜 전달, 미실행 시 null 전달
        // 생필품: 백엔드에 저장된 AI 예측 날짜 그대로 전달
        const productDate = isFoodCategory(item.category)
          ? (isScanned ? (item.product_date ?? null) : null)
          : (item.product_date ?? null);

        return {
          ocritem_id: Number(item.ocritem_id ?? item.ocr_item_id ?? item.id ?? 0),
          product_name: item.product_name ?? '',
          category: item.category ?? '',
          subcategory: item.subcategory ?? '',
          product_date: productDate,
          total_amount: Number(item.total_amount ?? item.amount ?? item.quantity ?? 1),
          unit: item.unit ?? '개',
        };
      }),
    };

    try {
      setIsRegistering(true);
      setMessage('상품을 등록하는 중입니다...');
      console.log('등록 요청 payload:', payload);

      await registerProducts(payload);
      await onSuccess?.();
      onClose();
    } catch (error) {
      console.error('상품 등록 실패:', error);
      alert('상품 등록 중 오류가 발생했습니다.');
      setMessage('');
    } finally {
      setIsRegistering(false);
    }
  };

  const hasScanned = scannedIds.length > 0;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isRegistering) {
          onClose();
        }
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        capture="environment"
        onClick={(e) => e.stopPropagation()}
        onChange={handleFileChange}
      />

      <div
        className="modal-container ocr-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-ocr-title"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 헤더 */}
        <div className="modal-header">
          <div className="receipt-ocr-result">
            인식 완료 : 식료품 {foodCount}개, 생필품 {dailyCount}개
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isRegistering}
            aria-label="닫기"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="modal-body ocr-modal-body">
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
                const itemId = getItemKey(item, index);
                const isScanned = scannedIds.includes(itemId);
                const isUploading = uploadingId === itemId;
                const remainingDays = item.product_date
                  ? getRemainingDays(item.product_date)
                  : null;

                let dateLabel;
                if (isFoodCategory(item.category)) {
                  if (isScanned || item.product_date) {
                    dateLabel = item.product_date
                      ? item.product_date.replaceAll('-', '.')
                      : '기한 미설정';
                  } else {
                    dateLabel = `임시 ${remainingDays > 0 ? '+' : ''}${remainingDays || 0}일`;
                  }
                } else {
                  if (remainingDays === null) {
                    dateLabel = item.product_date
                      ? item.product_date.replaceAll('-', '.')
                      : '예측 불가';
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

                      {isFoodCategory(item.category) && (
                        <button
                          type="button"
                          className="receipt-ocr-camera"
                          onClick={(e) => handleCameraClick(e, itemId)}
                          disabled={isUploading || isRegistering}
                          aria-label={`${item.product_name} 소비기한 인식`}
                          title="소비기한 촬영 인식"
                        >
                          <FontAwesomeIcon icon={faCamera} spin={isUploading} />
                        </button>
                      )}
                    </div>
                    <span className="receipt-ocr-date">
                      {isUploading ? '인식 중...' : dateLabel}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* 등록 안내 메시지 */}
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
            disabled={items.length === 0 || isRegistering}
          >
            {isRegistering ? '등록 중...' : hasScanned ? '등록하기' : '네, 임시 기한 적용'}
          </button>
        </div>
      </div>
    </div>
  );
}