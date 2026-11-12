import React, { useState, useEffect } from 'react';
import './CreateGroupBuyModal.css'; // 기존 작성 모달 CSS 재사용
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export default function EditGroupBuyModal({ isOpen, onClose, initialData, onSubmit }) {
  const [formData, setFormData] = useState({
    neighborhood: '서울특별시 성북구',
    title: '',
    price: '',
    location: '',
    capacity: '',
    description: ''
  });

  // 모달이 열릴 때 기존 상세 게시글 데이터를 폼에 채워 넣음
  useEffect(() => {
    if (isOpen && initialData) {
      // '모집중 (1/2명)' 문자열에서 숫자 '2' 추출 (없을 경우 기본값 처리)
      const parsedCapacity = initialData.badge
        ? initialData.badge.replace(/.*\/(\d+)명.*/, '$1')
        : '';

      setFormData({
        neighborhood: initialData.neighborhood || '서울특별시 성북구',
        title: initialData.title || '',
        price: initialData.price || '',
        location: initialData.location || '',
        capacity: initialData.capacity || parsedCapacity,
        description: initialData.description || ''
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
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

          {/* 제품명 */}
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
              onChange={handleChange}
              placeholder="제품명을 입력해주세요"
            />
          </div>

          {/* 1인당 부담금 */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="edit-price" className="form-label">1인당 부담금</label>
            </div>
            <input
              type="text"
              id="edit-price"
              name="price"
              className="edit-input"
              value={formData.price}
              onChange={handleChange}
              placeholder="1인당 부담금을 입력해주세요"
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
              placeholder="픽업 장소를 입력해주세요"
            />
          </div>

          {/* 모집 인원 (명) */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="edit-capacity" className="form-label">모집 인원 (명)</label>
            </div>
            <input
              type="number"
              id="edit-capacity"
              name="capacity"
              min="2"
              className="edit-input"
              value={formData.capacity}
              onChange={handleChange}
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