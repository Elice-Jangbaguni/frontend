import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Layout from '../Main/Layout';
import CreateGroupBuyModal from './CreateGroupBuyModal';
import ChatFloatingButton from '../Chat/ChatFloatingButton';
import ChatModal from '../Chat/ChatModal';
import './GroupBuyPage.css';

// 단일 상품 더미 데이터
const sampleProduct = {
  id: 1,
  badge: '모집중 (1/2명)',
  title: '퍼글리 캡슐 세제 코튼캔디 향',
  price: '12,180',
  location: '강북구청 앞',
  imageUrl: 'https://thumbnail.coupangcdn.com/thumbnails/remote/640x640ex/image/vendor_inventory/8510/5e1707958f1f47428c08acae84c9999c567455ffb11d7020f8887705d223.jpg'
};

// 참여 중인 공구 / 우리 동네 공구 목록 생성
const participatingList = Array(6).fill(sampleProduct);
const neighborhoodList = Array(30).fill(sampleProduct);

export default function GroupBuyPage() {
  const navigate = useNavigate();

  // 공구 작성 모달 및 채팅 모달 상태 관리
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // 상세 페이지 이동
  const handleToDetail = () => {
    navigate('/groupbuy/detail');
  };

  return (
    <Layout>
      <main className="page-container">
        {/* 참여 중인 공구 헤더 및 공구 열기 버튼 */}
        <div className="page-section-header">
          <h2 className="page-section-title">참여 중인 공구</h2>
          <button className="create-btn" onClick={() => setIsCreateModalOpen(true)}>
            <FontAwesomeIcon icon={faPlus} />
            공구 열기
          </button>
        </div>

        {/* 참여 중인 공구 가로 슬라이더 */}
        <section className="groupbuy-section">
          <div className="surface-box">
            <div className="card-slider">
              {participatingList.map((item, index) => (
                // 개별 공구 상품 카드
                <div className="groupbuy-card slider-card" key={`part-${index}`} onClick={handleToDetail}>
                  <div className="image-wrapper">
                    <span className="status-badge">{item.badge}</span>
                    <img src={item.imageUrl} alt={item.title} className="product-image" />
                  </div>
                  <div className="card-content">
                    <h3 className="product-title">{item.title}</h3>
                    <p className="product-price">
                      <strong>{item.price}</strong> 원
                    </p>
                    <p className="product-place">
                      <span className="place-icon">📍</span> {item.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 우리 동네 공구 헤더 및 지역 태그 */}
        <div className="page-section-header">
          <div className="page-section-title-group">
            <h2 className="page-section-title">우리 동네 공구</h2>
            <span className="location-tag">서울특별시 성북구</span>
          </div>
        </div>

        {/* 우리 동네 공구 카드 그리드 */}
        <section className="groupbuy-section">
          <div className="surface-box">
            <div className="card-grid">
              {neighborhoodList.map((item, index) => (
                // 개별 공구 상품 카드
                <div className="groupbuy-card" key={`neigh-${index}`} onClick={handleToDetail}>
                  <div className="image-wrapper">
                    <span className="status-badge">{item.badge}</span>
                    <img src={item.imageUrl} alt={item.title} className="product-image" />
                  </div>
                  <div className="card-content">
                    <h3 className="product-title">{item.title}</h3>
                    <p className="product-price">
                      <strong>{item.price}</strong> 원
                    </p>
                    <p className="product-place">
                      <span className="place-icon">📍</span> {item.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 공구 작성 모달 */}
      <CreateGroupBuyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* 우측 하단 채팅 플로팅 버튼 및 모달 */}
      <ChatFloatingButton onClick={() => setIsChatOpen(true)} />
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </Layout>
  );
}