import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Mainpage.css';

export default function Layout({ children }) {

  const navigate = useNavigate();

  // 메인 이동
  const handleGoToMain = () => {
    navigate('/');
  };

  // 로그인 페이지 이동
  const handleGoToLogin = () => {
    navigate('/login');
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
          <div className="login-text" onClick={handleGoToLogin}>로그인</div>
          <div className="signup-text">회원가입</div>
        </div>
      </header>

      {/* 2. 각 페이지 내용이 들어가는 자리 */}
      <main className="main-content">
        {children}
      </main>

      {/* 3. 푸터 그대로 넣기 */}
      <footer className="main-footer">
        <div className="footer-content">
          <p className="footer-project-title">
            장바구니 : 영수증 OCR & AI 소비주기 예측 기반 1인 가구 식재품/생필품 관리 웹 서비스
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

    </div>
  );
}