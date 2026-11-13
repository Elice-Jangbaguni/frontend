import React, { useState } from 'react';
import './CreateGroupBuyModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export default function CreateGroupBuyModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    neighborhood: '서울특별시 성북구',
    title: '',
    price: '',
    location: '',
    capacity: '',
    description: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 1인당 부담금: 숫자만 추출 -> 천 단위 콤마 + '원' 자동 부착
  const handlePriceChange = (e) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    const formattedValue = numericValue
      ? `${Number(numericValue).toLocaleString("ko-KR")}원`
      : "";

    setFormData((prev) => ({
      ...prev,
      price: formattedValue
    }));
  };

  // 모집 인원: 숫자만 입력되도록 처리
  const handleCapacityChange = (e) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      capacity: numericValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('제품명을 입력해주세요.');
      return;
    }
    if (onSubmit) {
      onSubmit(formData);
    }
    alert('공구가 작성되었습니다!');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* 상단 헤더 */}
        <div className="modal-header">
          <h3>공구 작성</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="닫기">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* 스크롤 가능한 폼 본문 */}
        <form id="create-groupbuy-form" className="modal-body" onSubmit={handleSubmit}>
          {/* 동네 */}
          <div className="form-group">
            <div className="label-wrapper">
              <label className="form-label">동네</label>
            </div>
            <div className="neighborhood-badge">
              {formData.neighborhood}
            </div>
          </div>

          {/* 제품명 */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="title" className="form-label">제품명</label>
            </div>
            <input
              type="text"
              id="title"
              name="title"
              className="write-input"
              value={formData.title}
              onChange={handleChange}
              placeholder="제품명을 입력해주세요."
            />
          </div>

          {/* 1인당 부담금 */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="price" className="form-label">1인당 부담금</label>
            </div>
            <input
              type="text"
              inputMode="numeric"
              id="price"
              name="price"
              className="write-input"
              value={formData.price}
              onChange={handlePriceChange}
              placeholder="1인당 부담금을 입력해주세요."

              onKeyDown={(e) => {
                if (e.key === 'Backspace' && formData.price.endsWith('원')) {
                  e.preventDefault();
                  const withoutWon = formData.price.slice(0, -1).replace(/[^0-9]/g, "");
                  const nextDigits = withoutWon.slice(0, -1);
                  setFormData((prev) => ({
                    ...prev,
                    price: nextDigits ? `${Number(nextDigits).toLocaleString("ko-KR")}원` : ""
                  }));
                }
              }}
            />
          </div>

          {/* 픽업 장소 */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="location" className="form-label">픽업 장소</label>
              <span className="status-message success">
                상의 후 변경 가능합니다.
              </span>
            </div>
            <input
              type="text"
              id="location"
              name="location"
              className="write-input"
              value={formData.location}
              onChange={handleChange}
              placeholder="픽업 장소를 입력해주세요."
            />
          </div>

          {/* 모집 인원 (명) */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="capacity" className="form-label">모집 인원 (명)</label>
            </div>
            <input
              type="text"
              inputMode="numeric"
              id="capacity"
              name="capacity"
              className="write-input"
              value={formData.capacity}
              onChange={handleCapacityChange}
              placeholder="모집 인원을 입력해주세요."
            />
          </div>

          {/* 설명 */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="description" className="form-label">설명</label>
            </div>
            <textarea
              id="description"
              name="description"
              className="write-textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="제품명, 공구 방식, 연락 수단 등 공구 정보를 자세히 기재해주세요."
            />
          </div>
        </form>

        {/* 하단 푸터 */}
        <div className="modal-footer">
          <button type="submit" form="create-groupbuy-form" className="modal-confirm-btn">
            작성 완료
          </button>
        </div>
      </div>
    </div>
  );
}