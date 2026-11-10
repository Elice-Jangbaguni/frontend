import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Main/Layout';
import './LogInPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [userPw, setUserPw] = useState('');

  // 💡 DB 연동 전 임시(Mock) 로그인 핸들러
  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (!userId.trim() || !userPw.trim()) {
      alert('아이디와 비밀번호를 입력해 주세요.');
      return;
    }

    // localStorage에 임시 로그인 상태 및 유저 정보 저장
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', '이승민');

    // 메인 페이지(또는 재고 관리/공동구매 페이지)로 이동
    navigate('/');
  };

  // 회원가입 버튼 클릭 시 이동
  const handleGoToSignup = () => {
    navigate('/signup');
  };

  return (
    <Layout showFooter={false}>
      {/* 타이틀 */}
      <h2 className="login-title">로그인</h2>

      {/* 로그인 폼 섹션 */}
      <section className="login-section">
        <form className="login-form" onSubmit={handleLoginSubmit}>
          <input
            type="text"
            className="id-field"
            id="userid"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            type="password"
            className="pw-field"
            id="userpw"
            placeholder="비밀번호"
            value={userPw}
            onChange={(e) => setUserPw(e.target.value)}
          />

          <button type="submit" className="login-btn">
            로그인
          </button>
          <button 
            type="button" 
            className="signup-btn"
            onClick={handleGoToSignup}
          >
            회원가입
          </button>
        </form>
      </section>
    </Layout>
  );
}