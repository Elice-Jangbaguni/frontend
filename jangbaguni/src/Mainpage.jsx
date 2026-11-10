import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import './Mainpage.css';

export default function MainPage() {

  const navigate = useNavigate();

  // 로그인 페이지로 이동하는 핸들러
  const handleGoToLogin = () => {
    navigate('/login'); 
  };
  
  return (
    <Layout>
      {/* 상단 다크 배너 */}
      <div className="top-banner">
        <span>혼자 사는 집 식료품 & 생필품 관리, 고민된다면?</span>
        <button className="banner-link" onClick={handleGoToLogin}>
          30초 만에 시작하기
        </button>
      </div>

      {/* 메인 히어로 섹션 */}
      <section className="main-section">
        {/* 둥둥 떠있는 이모지 파티클 */}
        <div className="floating-emoji top-left">🥦</div>
        <div className="floating-emoji top-right">🍎</div>
        <div className="floating-emoji bottom-left">🧻</div>
        <div className="floating-emoji bottom-right">🧴</div>

        <h1 className="hero-title">
          <span className="highlight-navy">식료품도</span>, <span className="highlight-red">생필품도</span><br />
          모든 관리는, 장바구니
        </h1>

        <p className="hero-description">
          영수증 한 장으로 끝내는 냉장고 정리,<br />
          <span className="highlight-black">소비 주기 예측</span>부터 <span className="highlight-black">동네 공동구매</span>까지 낭비 없는 일상을 완성하세요!
        </p>

        <div className="hero-action">
          <button className="btn-start" onClick={handleGoToLogin}>
            장바구니 시작하기
          </button>
        </div>
      </section>

      {/* 왜 '장바구니'를 써야 할까요? 특징 섹션 */}
      <section className="why-section">
        <div className="why-header">
          <h2 className="why-title">왜 ‘장바구니’를 써야 할까요?</h2>
          <p className="why-subtitle">복잡한 입력 없이 사진 한 장으로 끝내는 똑똑한 라이프스타일</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="card-emoji">📑</div>
            <h3 className="card-title">영수증 자동 인식</h3>
            <p className="card-desc">
              마트 영수증만 찍으면 식료품과 생필품이 함께 자동 등록됩니다.
            </p>
          </div>

          <div className="feature-card">
            <div className="card-emoji">🤖</div>
            <h3 className="card-title">소비 주기 인식 알림</h3>
            <p className="card-desc">
              휴지나 바디워시가 떨어지기 전, AI가 사용자의 소비 패턴을 예측해 구매 시점을 미리 알려줍니다.
            </p>
          </div>

          <div className="feature-card">
            <div className="card-emoji">🤝</div>
            <h3 className="card-title">동네 공동구매</h3>
            <p className="card-desc">
              부담스러운 대용량 수량은 동네 이웃과 딱 필요한 만큼만 나누어 구매하세요.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}