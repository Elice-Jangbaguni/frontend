import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import './CreateGroupBuyModal.css';

export default function EditGroupBuyModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    region: '서울특별시 성북구',
    title: '',
    price: '',
    location: '',
    capacity: '',
    description: '',
  });

  const formatPrice = (value) => {
    const numericValue = String(value ?? '').replace(/[^0-9]/g, '');
    return numericValue ? `${Number(numericValue).toLocaleString('ko-KR')}원` : '';
  };

  // 수정 버튼 클릭 시 기존 폼 내용 채우기
  useEffect(() => {
    if (isOpen && initialData) {
      const parsedCapacity = initialData.badge
        ? initialData.badge.replace(/.*\/(\d+)명.*/, '$1')
        : '';

      setFormData({
        region: initialData.region || '서울특별시 성북구',
        title: initialData.title || '',
        price: formatPrice(initialData.price),
        location: initialData.location || '',
        capacity: String(initialData.capacity || parsedCapacity || ''),
        description: initialData.description || '',
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePriceChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      price: formatPrice(e.target.value),
    }));
  };

  const handleCapacityChange = (e) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, '');
    setFormData((prev) => ({
      ...prev,
      capacity: numericValue,
    }));
  };

  // 공동구매 수정 API(PUT /api/group_buy/{buy_id}) 전송용 payload 구성 후 상위 핸들러 호출
  const handleSubmit = async (e) => {
    e.preventDefault();

    const numericPrice = Number(String(formData.price).replace(/[^0-9]/g, ''));
    const numericCapacity = Number(String(formData.capacity).replace(/[^0-9]/g, ''));

    if (!formData.title.trim()) {
      alert('제품명을 입력해주세요.');
      return;
    }
    if (!numericPrice) {
      alert('1인당 부담금을 입력해주세요.');
      return;
    }
    if (!formData.location.trim()) {
      alert('픽업 장소를 입력해주세요.');
      return;
    }
    if (numericCapacity < 2) {
      alert('모집 인원은 최소 2명 이상이어야 합니다.');
      return;
    }

    const payload = {
      region: formData.region,
      product_name: formData.title.trim(),
      price: numericPrice,
      place: formData.location.trim(),
      number_of_people: numericCapacity,
      description: formData.description.trim(),
    };

    if (onSubmit) {
      await onSubmit(payload);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>공구 수정</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="닫기">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form id="edit-groupbuy-form" className="modal-body" onSubmit={handleSubmit}>
          {/* 동네 */}
          <div className="form-group">
            <div className="label-wrapper">
              <label className="form-label">동네</label>
            </div>
            <div className="neighborhood-badge">
              {formData.region}
            </div>
          </div>

          {/* 제품명 (수정 불가) */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="edit-title" className="form-label">제품명</label>
              <span className="status-message error">
                변경 불가능합니다.
              </span>
            </div>
            <input
              type="text"
              id="edit-title"
              name="title"
              className="edit-input"
              value={formData.title}
              readOnly
            />
          </div>

          {/* 1인당 부담금 */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="edit-price" className="form-label">1인당 부담금</label>
            </div>
            <input
              type="text"
              inputMode="numeric"
              id="edit-price"
              name="price"
              className="edit-input"
              value={formData.price}
              onChange={handlePriceChange}
              placeholder="1인당 부담금을 입력해주세요."
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && formData.price.endsWith('원')) {
                  e.preventDefault();
                  const withoutWon = formData.price.slice(0, -1).replace(/[^0-9]/g, '');
                  const nextDigits = withoutWon.slice(0, -1);
                  setFormData((prev) => ({
                    ...prev,
                    price: nextDigits ? `${Number(nextDigits).toLocaleString('ko-KR')}원` : '',
                  }));
                }
              }}
            />
          </div>

          {/* 픽업 장소 */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="edit-location" className="form-label">픽업 장소</label>
            </div>
            <input
              type="text"
              id="edit-location"
              name="location"
              className="edit-input"
              value={formData.location}
              onChange={handleChange}
              placeholder="픽업 장소를 입력해주세요."
            />
          </div>

          {/* 모집 인원 (명) */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="edit-capacity" className="form-label">모집 인원 (명)</label>
            </div>
            <input
              type="text"
              inputMode="numeric"
              id="edit-capacity"
              name="capacity"
              className="edit-input"
              value={formData.capacity}
              onChange={handleCapacityChange}
              placeholder="모집 인원을 입력해주세요."
            />
          </div>

          {/* 설명 */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="edit-description" className="form-label">설명</label>
            </div>
            <textarea
              id="edit-description"
              name="description"
              className="edit-textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="제품명, 공구 방식, 연락 수단 등 공구 정보를 자세히 기재해주세요."
            />
          </div>
        </form>

        <div className="modal-footer">
          <button
            type="submit"
            form="edit-groupbuy-form"
            className="modal-confirm-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? '수정 중...' : '수정 완료'}
          </button>
        </div>
      </div>
    </div>
  );
}