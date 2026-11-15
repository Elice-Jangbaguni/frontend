import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import './CreateGroupBuyModal.css';

export default function CreateGroupBuyModal({ isOpen, onClose, onSubmit, isSubmitting = false }) {
  // 공구 작성 입력 폼 데이터 상태 관리
  const [formData, setFormData] = useState({
    region: '서울특별시 성북구',
    product_name: '',
    price: '',
    place: '',
    number_of_people: '',
    description: ''
  });

  // 숫자 추출 후 천 단위 콤마 및 '원' 부착 헬퍼
  const handlePriceChange = (e) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, '');
    const formattedValue = numericValue
      ? `${Number(numericValue).toLocaleString('ko-KR')}원`
      : '';

    setFormData((prev) => ({
      ...prev,
      price: formattedValue
    }));
  };

  if (!isOpen) return null;

  // 일반 텍스트 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 모집 인원 숫자만 입력 처리
  const handleCapacityChange = (e) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, '');
    setFormData((prev) => ({
      ...prev,
      number_of_people: numericValue
    }));
  };

  // 공구 작성 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    const numericPrice = Number(formData.price.replace(/[^0-9]/g, ''));
    const numericCapacity = Number(formData.number_of_people.replace(/[^0-9]/g, ''));

    if (!formData.product_name.trim()) {
      alert('제품명을 입력해주세요.');
      return;
    }
    if (!numericPrice) {
      alert('1인당 부담금을 입력해주세요.');
      return;
    }
    if (!formData.place.trim()) {
      alert('픽업 장소를 입력해주세요.');
      return;
    }
    if (numericCapacity < 2) {
      alert('모집 인원은 최소 2명 이상이어야 합니다.');
      return;
    }

    const payload = {
      region: formData.region,
      product_name: formData.product_name.trim(),
      price: numericPrice,
      place: formData.place.trim(),
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
            {/* 동네 표시 배지 */}
            <div className="neighborhood-badge">
              {formData.region}
            </div>
          </div>

          {/* 제품명 */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="product_name" className="form-label">제품명</label>
            </div>
            <input
              type="text"
              id="product_name"
              name="product_name"
              className="write-input"
              value={formData.product_name}
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
              <label htmlFor="place" className="form-label">픽업 장소</label>
              <span className="status-message success">
                상의 후 변경 가능합니다.
              </span>
            </div>
            <input
              type="text"
              id="place"
              name="place"
              className="write-input"
              value={formData.place}
              onChange={handleChange}
              placeholder="픽업 장소를 입력해주세요."
            />
          </div>

          {/* 모집 인원 (명) */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="number_of_people" className="form-label">모집 인원 (명)</label>
            </div>
            <input
              type="text"
              inputMode="numeric"
              id="number_of_people"
              name="number_of_people"
              className="write-input"
              value={formData.number_of_people}
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
          <button
            type="submit"
            form="create-groupbuy-form"
            className="modal-confirm-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? '작성 중...' : '작성 완료'}
          </button>
        </div>
      </div>
    </div>
  );
}