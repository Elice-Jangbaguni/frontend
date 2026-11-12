import React, { useState } from 'react';
import Layout from '../Main/Layout';
import './GroupBuyDetailPage.css';
import EditGroupBuyModal from './EditGroupBuyModal';

export default function GroupBuyDetailPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [detailData, setDetailData] = useState({
    neighborhood: '서울특별시 성북구',
    badge: '모집중 (1/2명)',
    title: '토레타 이온음료 340ml',
    price: '12,180',
    location: '성신여대 정문 앞',
    sellerName: '공구주 이름',
    imageUrl: 'https://thumbnail.coupangcdn.com/thumbnails/remote/657x657q90trim/image/retail/images/92420907427591-1d313b60-ec44-4332-a2e6-7a246473bb4c.jpg',
    description: `48개 6명이서 8개씩 공구하실 분!
편하게 연락 주세요!

픽업 장소, 시간은 다 모이면 다시 얘기하겠습니다!
여성분만 받을게요 !

성신여대 재학생 분들이면 더 좋을 것 같습니다 !! ^^
일단 편하게 연락 주세요`
  });

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = (updatedForm) => {
    setDetailData((prev) => ({
      ...prev,
      title: updatedForm.title,
      price: updatedForm.price,
      location: updatedForm.location,
      badge: updatedForm.capacity ? `모집중 (1/${updatedForm.capacity}명)` : prev.badge,
      description: updatedForm.description
    }));
  };

  const handleDelete = () => {
    alert('정말 삭제하시겠습니까?');
  };

  const handleChat = () => {
    alert('채팅방으로 이동합니다.');
  };

  return (
    <Layout>
      <div className="detail-area">
        <div className="detail-section">
          {/* 좌측: 상품 이미지 및 공구주 정보 */}
          <div className="detail-left">
            <div className="detail-image-wrapper">
              <img 
                src={detailData.imageUrl} 
                alt={detailData.title} 
                className="detail-product-image" 
              />
            </div>
            <div className="seller-badge">
              {detailData.sellerName}
            </div>
          </div>

          {/* 우측: 상품 상세 정보 및 채팅 버튼 */}
          <div className="detail-right">
            <div className="status-badge-detail">
              {detailData.badge}
            </div>

            <h1 className="detail-title">{detailData.title}</h1>

            <div className="price-location-row">
              <div className="price-area">
                <span className="price-label">1인당 부담금</span>
                <div className="price-value">
                  <strong>{detailData.price}</strong>원
                </div>
              </div>
              <div className="location-area">
                <span className="location-icon">📍</span> {detailData.location}
              </div>
            </div>

            <hr className="detail-divider" />

            <div className="detail-description">
              {detailData.description.split('\n').map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </div>

            <div className="action-button-group">
              <button className="edit-btn" onClick={handleEdit}>
                수정
              </button>
              <button className="delete-btn" onClick={handleDelete}>
                삭제
              </button>
            </div> 
            <button className="chat-btn" onClick={handleChat}>
              채팅
            </button>
          </div>
        </div>
      </div>

      {/* 공구 수정 모달 팝업 */}
      <EditGroupBuyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={detailData}
        onSubmit={handleUpdateSubmit}
      />
    </Layout>
  );
}