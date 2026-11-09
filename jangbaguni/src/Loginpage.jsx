import React from 'react';
import Layout from './Layout';
import './Loginpage.css';

export default function LoginPage() {
  return (
    <Layout>
      {/* 타이틀 */}
      <h2 className="login-title">로그인</h2>

      {/* 로그인 폼 섹션 */}
      <section className="login-section">
        <form className="login-form">

          <input
            type="text"
            className="id-field"
            id="userid"
            placeholder="아이디"
          />
          <input
            type="password"
            className="pw-field"
            id="userpw"
            placeholder="비밀번호"
          />

          <button type="submit" className="login-btn">
            로그인
          </button>
          <button type="button" className="signup-btn">
            회원가입
          </button>
        </form>
      </section>
    </Layout>
  );
}