import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import './CreateGroupBuyModal.css';

export default function EditGroupBuyModal({ isOpen, onClose, initialData, onSubmit }) {
  // 공구 수정 입력 폼 데이터 상태 관리
  const [formData, setFormData] = useState({
    neighborhood: '서울특별시 성북구',
    title: '',
    price: '',
    location: '',
    capacity: '',
    description: ''
  });

  // 숫자 추출 후 천 단위 콤마 및 '원' 부착 헬퍼
  const formatPrice = (value) => {
    const numericValue = String(value ?? '').replace(/[^0-9]/g, '');
    return numericValue ? `${Number(numericValue).toLocaleString('ko-KR')}원` : '';
  };

  // 모달 열릴 때 기존 상세 게시글 데이터 반영
  useEffect(() => {
    if (isOpen && initialData) {
      const parsedCapacity = initialData.badge
        ? initialData.badge.replace(/.*\/(\d+)명.*/, '$1')
        : '';

      setFormData({
        neighborhood: initialData.neighborhood || '서울특별시 성북구',
        title: initialData.title || '',
        price: formatPrice(initialData.price),
        location: initialData.location || '',
        capacity: initialData.capacity || parsedCapacity,
        description: initialData.description || ''
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // 일반 텍스트 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 1인당 부담금 포맷 적용
  const handlePriceChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      price: formatPrice(e.target.value)
    }));
  };

  // 모집 인원 숫자만 입력 처리
  const handleCapacityChange = (e) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, '');
    setFormData((prev) => ({
      ...prev,
      capacity: numericValue
    }));
  };

  // 공구 수정 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('제품명을 입력해주세요.');
      return;
    }
    if (onSubmit) {
      onSubmit(formData);
    }
    alert('공구 정보가 수정되었습니다!');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* 상단 헤더 */}
        <div className="modal-header">
          <h3>공구 수정</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="닫기">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* 스크롤 가능한 폼 본문 */}
        <form id="edit-groupbuy-form" className="modal-body" onSubmit={handleSubmit}>
          {/* 동네 */}
          <div className="form-group">
            <div className="label-wrapper">
              <label className="form-label">동네</label>
            </div>
            <div className="neighborhood-badge">
              {formData.neighborhood}
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
                    price: nextDigits ? `${Number(nextDigits).toLocaleString('ko-KR')}원` : ''
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

        {/* 하단 푸터 */}
        <div className="modal-footer">
          <button type="submit" form="edit-groupbuy-form" className="modal-confirm-btn">
            수정 완료
          </button>
        </div>
      </div>
    </div>
  );
}