import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Mainpage.css';

export default function Layout({ children, showFooter = true }) {

  const location = useLocation();

  // 현재 경로 판별
  const isLoginPage = location.pathname === '/login';
  // 약관동의(/terms) 또는 회원가입(/signup) 페이지일 때 회원가입 텍스트 활성화
  const isSignupPage = location.pathname === '/terms' || location.pathname === '/signup';
  
  const navigate = useNavigate();

  // 메인 이동
  const handleGoToMain = () => {
    navigate('/');
  };

  // 로그인 페이지 이동
  const handleGoToLogin = () => {
    navigate('/login');
  };

  // 약관 동의 페이지 이동
  const handleGoToTerms = () => {
    navigate('/terms');
  };

  return (
    <div className="main-wrapper">
      
      {/* 1. 헤더 그대로 넣기 */}
      <header className="main-header">
        <div className="header-left">
          <div className="logo-box" onClick={handleGoToMain}>
            <div className="logo-icon">🛒</div>
            <span className="logo-text">장바구니</span>
          </div>
          <nav className="main-nav"></nav>
        </div>

        <div className="header-right">
          <div className={`auth-text ${isLoginPage ? 'active' : ''}`} onClick={handleGoToLogin}>로그인</div>
          <div className={`auth-text ${isSignupPage ? 'active' : ''}`} onClick={handleGoToTerms}>
            회원 가입
          </div>
        </div>
      </header>

      {/* 2. 각 페이지 내용이 들어가는 자리 */}
      <main className="main-content">
        {children}
      </main>

      {/* 3. 푸터 그대로 넣기 */}
      {showFooter && (
        <footer className="main-footer">
          <div className="footer-content">
            <p className="footer-project-title">
              장바구니 : 영수증 OCR & AI 소비주기 예측 기반 1인 가구 식료품/생필품 관리 웹 서비스
            </p>
            <p className="footer-team">Developed by Team 장바구니 (Frontend & Backend)</p>
            
            <div className="footer-members">
              <p>
                Frontend : 이승민{' '}
                <a href="https://github.com/null4848" target="_blank" rel="noopener noreferrer" className="footer-link">
                  @null4848
                </a>
              </p>
              <p>
                Backend : 안소형{' '}
                <a href="https://github.com/ahnsohyeong" target="_blank" rel="noopener noreferrer" className="footer-link">
                  @ahnsohyeong
                </a>
              </p>
            </div>

            <p className="footer-github">
              GITHUB :{' '}
              <a href="https://github.com/Elice-Jangbaguni" target="_blank" rel="noopener noreferrer" className="footer-link">
                https://github.com/Elice-Jangbaguni
              </a>
            </p>

            <p className="footer-copy">© 2026 장바구니 Project. All rights reserved.</p>
          </div>
        </footer>
      )}

    </div>
  );
}