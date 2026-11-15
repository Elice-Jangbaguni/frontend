import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import Layout from '../Main/Layout';
import './SignUpPage.css';

export default function SignupPage() {
  // 회원가입 입력 폼 데이터 상태 관리
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    passwordConfirm: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    gender: '',
  });

  // 유효성 검사 상태 및 메시지 관리
  const [userIdStatus, setUserIdStatus] = useState({ isChecked: false, isSuccess: false, message: '' });
  const [passwordStatus, setPasswordStatus] = useState({ isSuccess: false, message: '' });
  const [passwordConfirmStatus, setPasswordConfirmStatus] = useState({ isSuccess: false, message: '' });

  // 비밀번호 실시간 세부 정규식 검사 함수
  const validatePassword = (pw) => {
    if (!pw) return { isSuccess: false, message: '' };

    // 1. 허용된 문자(영문, 숫자, !@#$) 외 다른 문자가 들어간 경우
    const allowedCharsRegex = /^[A-Za-z0-9!@#$]+$/;
    if (!allowedCharsRegex.test(pw)) {
      return { isSuccess: false, message: '문자, 숫자, !@#$만 들어갈 수 있습니다.' };
    }

    // 2. 8글자 미만인 경우
    if (pw.length < 8) {
      return { isSuccess: false, message: '8글자 이상의 비밀번호를 입력해주세요.' };
    }

    // 3. 20자 초과인 경우
    if (pw.length > 20) {
      return { isSuccess: false, message: '20자 이내의 비밀번호를 입력해주세요.' };
    }

    // 모든 조건 만족
    return { isSuccess: true, message: '' };
  };

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    // 아이디 변경 시 중복 확인 상태 초기화
    if (name === 'userId') {
      setUserIdStatus({ isChecked: false, isSuccess: false, message: '' });
    }

    // 비밀번호 실시간 검사
    if (name === 'password') {
      const status = validatePassword(value);
      setPasswordStatus(status);

      // 비밀번호가 수정되면 비밀번호 확인도 실시간 재비교
      if (updatedData.passwordConfirm) {
        checkPasswordMatch(value, updatedData.passwordConfirm);
      }
    }

    // 비밀번호 확인 실시간 검사
    if (name === 'passwordConfirm') {
      checkPasswordMatch(updatedData.password, value);
    }
  };

  // 비밀번호 일치 확인
  const checkPasswordMatch = (pw, pwConfirm) => {
    if (!pwConfirm) {
      setPasswordConfirmStatus({ isSuccess: false, message: '' });
    } else if (pw !== pwConfirm) {
      setPasswordConfirmStatus({ isSuccess: false, message: '비밀번호가 일치하지 않습니다.' });
    } else {
      setPasswordConfirmStatus({ isSuccess: true, message: '비밀번호가 일치합니다.' });
    }
  };

  // 아이디 중복 확인 버튼 클릭
  const handleCheckDuplicate = () => {
    const idRegex = /^[a-zA-Z0-9]{4,12}$/;

    if (!formData.userId.trim()) {
      setUserIdStatus({ isChecked: true, isSuccess: false, message: '아이디를 입력해 주세요.' });
      return;
    }
    if (!idRegex.test(formData.userId)) {
      setUserIdStatus({ isChecked: true, isSuccess: false, message: '영문, 숫자 4~12자로 입력해 주세요.' });
      return;
    }

    // 테스트 예시 ('seungmin' 입력 시 중복 처리)
    if (formData.userId === 'seungmin') {
      setUserIdStatus({ isChecked: true, isSuccess: false, message: '중복 아이디입니다.' });
    } else {
      setUserIdStatus({ isChecked: true, isSuccess: true, message: '사용 가능한 아이디 입니다.' });
    }
  };

  // 년/월/일 드롭다운 옵션 생성
  const years = Array.from({ length: 100 }, (_, i) => 2026 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    // 푸터 숨김 레이아웃
    <Layout showFooter={false}>
      {/* 상단 페이지 타이틀 및 진행 단계 */}
      <div className="auth-header-area">
        <h2 className="auth-title">정보 입력</h2>
        <div className="step-indicator">
          <span className="signup">Step 1/2 약관동의</span>
          <FontAwesomeIcon icon={faCaretRight} className="step-arrow" />
          <span className="step active">Step 2/2 정보입력</span>
        </div>
      </div>

      {/* 회원가입 입력 폼 섹션 */}
      <section className="auth-section">
        <form className="auth-form">
          {/* 아이디 입력 필드 */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="userId" className="form-label">아이디</label>
              {userIdStatus.isChecked && (
                // 유효성 안내 메시지 출력
                <span className={`status-message ${userIdStatus.isSuccess ? 'success' : 'error'}`}>
                  {userIdStatus.message}
                </span>
              )}
            </div>

            {/* 중복 확인 버튼 */}
            <div className="input-with-button">
              <input
                type="text"
                id="userId"
                name="userId"
                className="auth-input"
                value={formData.userId}
                onChange={handleChange}
                placeholder="영문, 숫자 포함 4~12자"
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

          {/* 비밀번호 입력 필드 */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="password" className="form-label">비밀번호</label>
              {passwordStatus.message && (
                // 유효성 안내 메시지 출력
                <span className="status-message error">
                  {passwordStatus.message}
                </span>
              )}
            </div>
            <input
              type="password"
              id="password"
              name="password"
              className="auth-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="문자, 숫자, 특수문자(!,@,#,$) 포함 8~20자"
            />
          </div>

          {/* 비밀번호 확인 입력 필드*/}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="passwordConfirm" className="form-label">비밀번호 확인</label>
              {passwordConfirmStatus.message && (
                // 유효성 안내 메시지 출력
                <span className={`status-message ${passwordConfirmStatus.isSuccess ? 'success' : 'error'}`}>
                  {passwordConfirmStatus.message}
                </span>
              )}
            </div>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              className="auth-input"
              value={formData.passwordConfirm}
              onChange={handleChange}
              placeholder="비밀번호 확인"
            />
          </div>

          {/* 생년월일 드롭다운 선택 필드 */}
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

          {/* 성별 라디오 버튼 선택 필드 */}
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
          <button type="submit" className="auth-primary-btn signup-submit-btn">
            가입완료
          </button>
        </form>
      </section>
    </Layout>
  );
}