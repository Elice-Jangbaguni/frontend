import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCamera, faTrash } from '@fortawesome/free-solid-svg-icons';
import AlertModal from '../Main/AlertModal';
import './CreateGroupBuyModal.css';

const INITIAL_FORM_DATA = {
  region: '서울특별시 성북구',
  product_name: '',
  price: '',
  place: '',
  number_of_people: '',
  description: '',
};

export default function CreateGroupBuyModal({ isOpen, onClose, onSubmit, isSubmitting = false }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [productImage, setProductImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const fileInputRef = useRef(null);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setProductImage(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  useEffect(() => {
    if (!productImage) {
      setPreviewUrl('');
      return;
    }

    const objectUrl = URL.createObjectURL(productImage);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [productImage]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

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

  const handleClose = () => {
    resetForm();
    if (onClose) {
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCapacityChange = (e) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, '');
    setFormData((prev) => ({
      ...prev,
      number_of_people: numericValue
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAlertMessage('이미지 파일만 첨부할 수 있습니다.');
      e.target.value = '';
      return;
    }

    setProductImage(file);
  };

  const handleRemoveImage = () => {
    setProductImage(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numericPrice = Number(formData.price.replace(/[^0-9]/g, ''));
    const numericCapacity = Number(formData.number_of_people.replace(/[^0-9]/g, ''));

    if (!formData.product_name.trim()) {
      setAlertMessage('제품명을 입력해주세요.');
      return;
    }
    if (!numericPrice) {
      setAlertMessage('1인당 부담금을 입력해주세요.');
      return;
    }
    if (!formData.place.trim()) {
      setAlertMessage('픽업 장소를 입력해주세요.');
      return;
    }
    if (numericCapacity < 2) {
      setAlertMessage('모집 인원은 최소 2명 이상이어야 합니다.');
      return;
    }

    const payload = {
      region: formData.region,
      product_name: formData.product_name.trim(),
      price: numericPrice,
      place: formData.place.trim(),
      number_of_people: numericCapacity,
      description: formData.description.trim(),
      product_image: productImage || undefined,
    };

    if (onSubmit) {
      await onSubmit(payload);
    }
    resetForm();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>공구 작성</h3>
          <button type="button" className="modal-close-btn" onClick={handleClose} aria-label="닫기">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form id="create-groupbuy-form" className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="label-wrapper">
              <label className="form-label">동네</label>
            </div>
            <div className="neighborhood-badge">
              {formData.region}
            </div>
          </div>

          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="product_image" className="form-label">제품 사진</label>
              <span className="status-message success">선택 사항</span>
            </div>
            <div className="image-upload-box">
              <input
                ref={fileInputRef}
                type="file"
                id="product_image"
                name="product_image"
                accept="image/*"
                className="image-upload-input"
                onChange={handleImageChange}
              />
              {previewUrl ? (
                <div className="image-preview-wrapper">
                  <img
                    src={previewUrl}
                    alt="첨부 제품 미리보기"
                    className="image-preview"
                  />
                  <div className="image-preview-meta">
                    <span className="image-file-name">{productImage?.name}</span>
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={handleRemoveImage}
                    >
                      <FontAwesomeIcon icon={faTrash} /> 사진 삭제
                    </button>
                  </div>
                </div>
              ) : (
                <label htmlFor="product_image" className="image-upload-trigger">
                  <FontAwesomeIcon icon={faCamera} className="image-upload-icon" />
                  <span className="image-upload-text">사진을 첨부하려면 클릭하세요</span>
                  <span className="image-upload-subtext">JPG, PNG, WEBP 이미지 지원</span>
                </label>
              )}
            </div>
          </div>

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

      <AlertModal
        open={Boolean(alertMessage)}
        message={alertMessage}
        onConfirm={() => setAlertMessage('')}
      />
    </div>
  );
}