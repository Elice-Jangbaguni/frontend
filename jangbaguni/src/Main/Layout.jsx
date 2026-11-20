import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBasketShopping } from '@fortawesome/free-solid-svg-icons';
import { logoutUser } from '../API/auth';
import AlertModal from './AlertModal';
import './MainPage.css';

export default function Layout({ children, showFooter = true }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로 판별
  const isLoginPage = location.pathname === '/login';
  const isSignupPage = location.pathname === '/terms' || location.pathname === '/signup';
  const isProductsPage = location.pathname === '/products';
  const isGroupBuyPage = location.pathname === '/groupbuy';

  // localStorage 기반 로그인 상태
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userName = localStorage.getItem('userName') || '회원';

  const [logoutAlertOpen, setLogoutAlertOpen] = useState(false);

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

  // 재고 관리 페이지 이동
  const handleGoToProducts = () => {
    navigate('/products');
  };

  // 공동 구매 페이지 이동
  const handleGoToGroupBuy = () => {
    navigate('/groupbuy');
  };

  // 로그아웃 버튼 클릭 이벤트
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      setLogoutAlertOpen(true);
    }
  };

  const handleConfirmLogout = () => {
    setLogoutAlertOpen(false);
    navigate('/');
  };

  return (
    <div className="main-wrapper">
      {/* 헤더 */}
      <header className="main-header">
        <div className="header-inner">
          <div className="header-left">
            {/* 로고 */}
            <div className="logo-box" onClick={handleGoToMain}>
              <FontAwesomeIcon icon={faBasketShopping} className="logo-icon" />
              <span className="logo-text">장바구니</span>
            </div>
          </div>

          {/* 로그인 시 표시 */}
          <nav className="header-center">
            {isLoggedIn && (
              <>
                <div className={`product ${isProductsPage ? 'active' : ''}`} onClick={handleGoToProducts}>
                  재고 관리
                </div>
                <div className={`groupbuy ${isGroupBuyPage ? 'active' : ''}`} onClick={handleGoToGroupBuy}>
                  공동 구매
                </div>
              </>
            )}
          </nav>

          <div className="header-right">
            {/* 로그인 O - userName, 로그아웃 */}
            {isLoggedIn ? (
              <>
                <div className="user-name">{userName}님</div>
                <div className="logout" onClick={handleLogout}>로그아웃</div>
              </>
            ) : (
              <>
                {/* 로그인 X - 로그인, 회원가입 */}
                <div className={`auth-text ${isLoginPage ? 'active' : ''}`} onClick={handleGoToLogin}>로그인</div>
                <div className={`auth-text ${isSignupPage ? 'active' : ''}`} onClick={handleGoToTerms}>회원 가입</div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 각 페이지 내용 */}
      <main className="main-content">
        {children}
      </main>

      {/* 푸터 */}
      {showFooter && (
        <footer className="main-footer">
          <div className="footer-inner">
            <div className="footer-grid">
              {/* 1열: 서비스 브랜딩 & 소개 */}
              <div className="footer-col footer-brand-col">
                <div className="footer-logo" onClick={handleGoToMain}>
                  <FontAwesomeIcon icon={faBasketShopping} className="footer-logo-icon" />
                  <span>장바구니</span>
                </div>
                <p className="footer-desc">
                  영수증 OCR 자동 인식과 AI 소비 주기 예측으로<br />
                  1인 가구의 식료품·생필품 관리부터 동네 공동구매까지<br />
                  낭비 없는 일상을 돕는 스마트 생활 관리 웹 서비스입니다.
                </p>
                <div className="footer-highlights">
                  <span>영수증 OCR</span>
                  <span>AI 소비 예측</span>
                  <span>동네 공동구매</span>
                </div>
              </div>

              {/* 2열: 팀 & 개발자 */}
              <div className="footer-col">
                <h4 className="footer-heading">TEAM</h4>
                <ul className="footer-list">
                  <li className="footer-member-row">
                    <span className="footer-label">Frontend</span>
                    <span className="footer-member-name">이승민</span>
                    <a
                      href="https://github.com/null4848"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                    >
                      @null4848
                    </a>
                  </li>
                  <li className="footer-member-row">
                    <span className="footer-label">Backend</span>
                    <span className="footer-member-name">안소형</span>
                    <a
                      href="https://github.com/ahnsohyeong"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                    >
                      @ahnsohyeong
                    </a>
                  </li>
                </ul>
              </div>

              {/* 3열: 링크 & 문의 */}
              <div className="footer-col">
                <h4 className="footer-heading">LINKS & CONTACT</h4>
                <ul className="footer-list">
                  <li className="footer-link-row">
                    <span className="footer-label">GitHub</span>
                    <a
                      href="https://github.com/Elice-Jangbaguni"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                    >
                      Elice-Jangbaguni
                    </a>
                  </li>
                  <li className="footer-link-row">
                    <span className="footer-label">Notion</span>
                    <a
                      href="https://fringe-minnow-8f4.notion.site/AI-40d9caa5c33a80d1b348e59e257ae30b?pvs=143"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                    >
                      프로젝트 기획 문서
                    </a>
                  </li>
                  <li className="footer-link-row">
                    <span className="footer-label">Figma</span>
                    <a
                      href="https://www.figma.com/design/jdA8ItKrGXJFyl8sY8taJk/%EC%9E%A5%EB%B0%94%EA%B5%AC%EB%8B%88?node-id=1019-1510&t=kSsJihpr5q2aNiHw-1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                    >
                      UI/UX 디자인 시안
                    </a>
                  </li>
                  <li className="footer-link-row">
                    <span className="footer-label">Email</span>
                    <a href="mailto:jangbaguni9@gmail.com" className="footer-link">
                      jangbaguni9@gmail.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* 하단 바 */}
            <div className="footer-bottom">
              <p className="footer-copy">© 2026 장바구니 (Jangbaguni). All rights reserved.</p>
              <p className="footer-subcopy">1인 가구 식료품·생필품 관리 & 동네 공동구매 서비스</p>
            </div>
          </div>
        </footer>
      )}

      <AlertModal
        open={logoutAlertOpen}
        message="로그아웃되었습니다."
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}