import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Main/Layout';
import './LogInPage.css';

export default function LoginPage() {
  const navigate = useNavigate();

  // 입력 폼 상태 관리
  const [userId, setUserId] = useState('');
  const [userPw, setUserPw] = useState('');

  // DB 연동 전 임시(Mock) 로그인 핸들러
  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (!userId.trim() || !userPw.trim()) {
      alert('아이디와 비밀번호를 입력해 주세요.');
      return;
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', '이승민');
    navigate('/');
  };

  // 회원가입 버튼 클릭 시 약관동의(Step 1/2)로 이동
  const handleGoToSignup = () => {
    navigate('/terms');
  };

  return (
    // 푸터 숨김 레이아웃
    <Layout showFooter={false}>
      {/* 상단 페이지 타이틀 */}
      <div className="auth-header-area">
        <h2 className="auth-title">로그인</h2>
      </div>

      {/* 로그인 입력 폼 섹션 */}
      <section className="auth-section">
        <form className="auth-form login-form" onSubmit={handleLoginSubmit}>
          {/* 아이디 / 비밀번호 입력 필드 */}
          <input
            type="text"
            className="auth-input"
            id="userid"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            type="password"
            className="auth-input"
            id="userpw"
            placeholder="비밀번호"
            value={userPw}
            onChange={(e) => setUserPw(e.target.value)}
          />

          {/* 로그인 / 회원가입 액션 버튼 */}
          <button type="submit" className="auth-primary-btn login-submit-btn">
            로그인
          </button>
          <button
            type="button"
            className="auth-secondary-btn"
            onClick={handleGoToSignup}
          >
            회원가입
          </button>
        </form>
      </section>
    </Layout>
  );
}