import React, { useState } from 'react';
import './Signuppage.css';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Layout from './Layout';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    passwordConfirm: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    gender: '',
  });

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 아이디 중복 확인 버튼
  const handleCheckDuplicate = () => {
    if (!formData.userId.trim()) {
      alert('아이디를 입력해 주세요.');
      return;
    }
    alert(`${formData.userId} - 중복 확인 기능 실행`);
  };

  // 년/월/일 드롭다운 옵션 생성
  const years = Array.from({ length: 100 }, (_, i) => 2026 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Layout>
      {/* 💥 h1 -> h2 로 변경 (LoginPage와 동일하게 통일) */}
      <h2 className="signup-title">회원가입</h2>

      <section className="signup-section">
        <form className="signup-form">
          {/* 아이디 */}
          <div className="form-group">
            <label htmlFor="userId" className="form-label">아이디</label>
            <div className="input-with-button">
              <input
                type="text"
                id="userId"
                name="userId"
                className="form-input"
                value={formData.userId}
                onChange={handleChange}
                placeholder="아이디 (영문, 숫자만 가능)"
              />
              <button
                type="button"
                className="check-btn"
                onClick={handleCheckDuplicate}
              >
                중복 확인
              </button>
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호 (문자, 숫자, 특수문자 포함 8~20자)"
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className="form-group">
            <label htmlFor="passwordConfirm" className="form-label">비밀번호 확인</label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              className="form-input"
              value={formData.passwordConfirm}
              onChange={handleChange}
              placeholder="비밀번호 확인"
            />
          </div>

          {/* 생년월일 */}
          <div className="form-group">
            <label className="form-label">생년월일</label>
            <div className="birth-select-group">
              <div className="select-wrapper">
                <select
                  name="birthYear"
                  className="form-select"
                  value={formData.birthYear}
                  onChange={handleChange}
                >
                  <option value="">년도</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <FontAwesomeIcon icon={faCaretDown} className="select-icon" />
              </div>

              <div className="select-wrapper">
                <select
                  name="birthMonth"
                  className="form-select"
                  value={formData.birthMonth}
                  onChange={handleChange}
                >
                  <option value="">월</option>
                  {months.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <FontAwesomeIcon icon={faCaretDown} className="select-icon" />
              </div>

              <div className="select-wrapper">
                <select
                  name="birthDay"
                  className="form-select"
                  value={formData.birthDay}
                  onChange={handleChange}
                >
                  <option value="">일</option>
                  {days.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <FontAwesomeIcon icon={faCaretDown} className="select-icon" />
              </div>
            </div>
          </div>

          {/* 성별 */}
          <div className="form-group gender-group">
            <label className="form-label">성별</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                />
                <span>여성</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                />
                <span>남성</span>
              </label>
            </div>
          </div>

          {/* 가입완료 버튼 */}
          <button type="submit" className="submit-btn">
            가입완료
          </button>
        </form>
      </section>
    </Layout>
  );
}