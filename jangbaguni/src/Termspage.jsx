import React, { useState } from 'react';
import { faCheck, faXmark, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import './Termspage.css';

// 약관 전문 데이터
const TERMS_DATA = {
  service: {
    title: '(필수) 서비스 이용 약관',
    content: `제1조 (목적)
본 약관은 '장바구니' 서비스가 제공하는 식재료 및 생필품 관리, AI 소비 주기 예측 및 이웃 간 묶음 구매 중개 서비스의 이용조건 및 절차를 규정합니다.

제2조 (서비스의 제공 및 변경)
1. 서비스는 영수증 OCR 기능을 통한 품목 자동 등록 및 소비 주기 알림을 제공합니다.
2. AI가 예측한 유통기한 및 소비 주기는 참고용 데이터이며, 실제 식재료 상태의 최종 관리 책임은 이용자에게 있습니다.

제3조 (이용자의 의무)
이용자는 타인의 정보 도용, 서비스 해킹, 허위 묶음 구매 모집 등의 행위를 해서는 안 됩니다.`
  },
  privacy: {
    title: '(필수) 개인정보 수집 및 이용 동의',
    content: `1. 수집하는 개인정보 항목
- 필수: 아이디(이메일), 비밀번호, 생년월일, 성별
- 서비스 이용 과정 수집: 영수증 구매 내역 데이터, 소비 패턴 기록

2. 개인정보 수집 및 이용 목적
- 회원 가입 식별 및 서비스 제공
- 영수증 OCR 품목 자동 등록 및 AI 소비 주기 예측
- 1/N 동네 묶음 구매 서비스 매칭

3. 보유 및 이용 기간
- 회원 탈퇴 시 즉시 파기 (법령에 따른 보존 의무 정보 제외)`
  },
  location: {
    title: '(선택) 위치 기반 서비스 이용 동의',
    content: `제1조 (목적)
본 약관은 이용자의 동네/지역 정보를 활용하여 '같이 사서 나눠요' 등 지역 기반 이웃 묶음 구매 기능을 제공하는 것을 목적으로 합니다.

제2조 (위치정보의 활용)
서비스는 회원 가입 및 동네 설정 시 입력된 행정동 단위 정보를 기반으로 매칭하며, 실시간 GPS 위치를 추적하지 않습니다.`
  }
};

export default function TermsPage() {
  const navigate = useNavigate();

  const [agreements, setAgreements] = useState({
    service: false,
    privacy: false,
    location: false,
  });

  const [modalKey, setModalKey] = useState(null);

  const handleToggle = (key) => {
    setAgreements((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isAllChecked = Object.values(agreements).every(Boolean);
  const handleToggleAll = () => {
    const nextState = !isAllChecked;
    setAgreements({
      service: nextState,
      privacy: nextState,
      location: nextState,
    });
  };

  // 필수 약관 동의 여부 검사
  const isRequiredAgreed = agreements.service && agreements.privacy;

  // 다음 단계 이동 (회원가입 폼으로 라우팅)
  const handleNextStep = () => {
    if (!isRequiredAgreed) return;
    navigate('/signup'); 
  };

  const openModal = (key) => setModalKey(key);
  const closeModal = () => setModalKey(null);

  return (
    <Layout showFooter={false}>
      <div className="terms-header-area">
        <h2 className="terms-title">이용약관 동의</h2>
        <div className="step-indicator">
          <span className="step active">Step 1/2 약관동의</span>
          <FontAwesomeIcon icon={faCaretRight} className="step-arrow" />
          <span className="step">Step 2/2 정보입력</span>
        </div>
      </div>

      <main className="terms-section">
        <div className="terms-form">
          {/* 전체 약관동의 */}
          <label className={`all-agree-box ${isAllChecked ? 'active' : ''}`}>
            <input
              type="checkbox"
              className="hidden-checkbox"
              checked={isAllChecked}
              onChange={handleToggleAll}
            />
            <FontAwesomeIcon icon={faCheck} className="all-check-icon" />
            <span>전체 약관동의</span>
          </label>

          {/* 약관 리스트 */}
          <ul className="terms-list">
            <li className="terms-item">
              <label className="terms-label-wrapper">
                <input
                  type="checkbox"
                  className="hidden-checkbox"
                  checked={agreements.service}
                  onChange={() => handleToggle('service')}
                />
                <FontAwesomeIcon
                  icon={faCheck}
                  className={`check-icon ${agreements.service ? 'checked' : ''}`}
                />
                <span className="terms-text">(필수) 서비스 이용 약관 동의</span>
              </label>
              <span className="more-link" onClick={() => openModal('service')}>더보기</span>
            </li>

            <li className="terms-item">
              <label className="terms-label-wrapper">
                <input
                  type="checkbox"
                  className="hidden-checkbox"
                  checked={agreements.privacy}
                  onChange={() => handleToggle('privacy')}
                />
                <FontAwesomeIcon
                  icon={faCheck}
                  className={`check-icon ${agreements.privacy ? 'checked' : ''}`}
                />
                <span className="terms-text">(필수) 개인정보 수집 및 이용 동의</span>
              </label>
              <span className="more-link" onClick={() => openModal('privacy')}>더보기</span>
            </li>

            <li className="terms-item">
              <label className="terms-label-wrapper">
                <input
                  type="checkbox"
                  className="hidden-checkbox"
                  checked={agreements.location}
                  onChange={() => handleToggle('location')}
                />
                <FontAwesomeIcon
                  icon={faCheck}
                  className={`check-icon ${agreements.location ? 'checked' : ''}`}
                />
                <span className="terms-text">(선택) 위치 기반 서비스 이용 동의</span>
              </label>
              <span className="more-link" onClick={() => openModal('location')}>더보기</span>
            </li>
          </ul>

          {/* 하단 네비게이션 바 */}
          <div
            className={`next-step-bar ${isRequiredAgreed ? 'enabled' : 'disabled'}`}
            onClick={handleNextStep}
          >
            <span>다음 단계로 이동</span>
            <FontAwesomeIcon icon={faCaretRight} className="next-arrow-icon" />
          </div>
        </div>
      </main>

      {/* 약관 상세 모달 */}
      {modalKey && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{TERMS_DATA[modalKey].title}</h3>
              <button type="button" className="modal-close-btn" onClick={closeModal}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="modal-body">
              <pre>{TERMS_DATA[modalKey].content}</pre>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="modal-confirm-btn"
                onClick={() => {
                  if (!agreements[modalKey]) handleToggle(modalKey);
                  closeModal();
                }}
              >
                동의하고 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}