import React from 'react';
import Layout from '../Main/Layout';
import './GroupBuypage.css';

// 하나의 단일 상품 더미 데이터
const sampleProduct = {
  id: 1,
  badge: '모집중 (1/2명)',
  title: '퍼글리 캡슐 세제 코튼캔디 향',
  price: '12,180',
  location: '강북구청 앞',
  imageUrl: 'https://thumbnail.coupangcdn.com/thumbnails/remote/640x640ex/image/vendor_inventory/8510/5e1707958f1f47428c08acae84c9999c567455ffb11d7020f8887705d223.jpg'
};

// 1개의 이미지/상품 정보만 가지고 목록 생성
const participatingList = Array(6).fill(sampleProduct);
const neighborhoodList = Array(30).fill(sampleProduct);

export default function GroupBuyPage() {
  return (
    <Layout>
      <div className="groupbuy-area">
        <h2 className="section-title">참여 중인 공구</h2>
        
        {/* 1. 참여 중인 공구 섹션 (가로 슬라이드 형태) */}
        <section className="groupbuy-section">  
          <div className="card-box">
            <div className="card-slider">
              {participatingList.map((item, index) => (
                <div className="groupbuy-card slider-card" key={`part-${index}`}>
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

        {/* 2. 우리 동네 공구 섹션 (기존 그리드 형태) */}
        <div className="section-header">
          <h2 className="section-title">우리 동네 공구</h2>
          <span className="location-tag">서울특별시 성북구</span>
        </div>

        <section className="groupbuy-section">
          <div className="card-box">
            <div className="card-grid">
              {neighborhoodList.map((item, index) => (
                <div className="groupbuy-card" key={`neigh-${index}`}>
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
      </div>
    </Layout>
  );
}