import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Main/Layout';
import { loginUser } from '../API/auth';
import './LogInPage.css';

export default function LoginPage() {
  const navigate = useNavigate();

  // 입력 폼 상태 관리
  const [userId, setUserId] = useState('');
  const [userPw, setUserPw] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // DB 연동 전 임시(Mock) 로그인 핸들러
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!userId.trim() || !userPw.trim()) {
      alert('아이디와 비밀번호를 입력해 주세요.');
      return;
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', '이승민');
    navigate('/');

        setIsLoading(true);
    try {
      // 백엔드 Request Body 스키마({ username, password })에 맞춰 요청
      const data = await loginUser(userId, userPw);
      console.log('로그인 성공 응답:', data);

      // Swagger 200 응답이 토큰 문자열("string") 또는 객체({ access_token })인 경우 모두 대응
      const token = typeof data === 'string' ? data : data?.access_token;
      if (token) {
        localStorage.setItem('access_token', token);
      }

      // 기존 프론트엔드 로그인 상태 관리 키 유지
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', userId);

      navigate('/products');
    } catch (error) {
      console.error('로그인 실패:', error.response?.data);
      if (error.response?.status === 404) {
        alert('로그인 API 경로를 찾을 수 없습니다. src/api/auth.js의 경로를 확인해 주세요.');
      } else if (error.response?.status === 422) {
        alert('아이디 또는 비밀번호 입력 형식이 올바르지 않습니다.');
      } else {
        alert(error.response?.data?.detail || '아이디 또는 비밀번호가 일치하지 않습니다.');
      }
    } finally {
      setIsLoading(false);
    }

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
          <button 
            type="submit" 
            className="auth-primary-btn login-submit-btn"
            disabled={isLoading}
          >
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