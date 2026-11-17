import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrashCan,
  faTriangleExclamation,
  faCartShopping,
  faMagnifyingGlass,
  faFolderOpen,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import Layout from '../Main/Layout';
import ReceiptOCRModal from './ReceiptOCRModal';
import { fetchProducts, deleteProduct,depleteProduct } from '../API/products';
import './ProductsPage.css';

export default function ProductsPage() {
  // 상태 관리 
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    expired_count: 0,
    warning_count: 0,
    recommended_items: []
  });
  const [loading, setLoading] = useState(true);  const [uploadOpen, setUploadOpen] = useState(false);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);

  // 컴포넌트 마운트 시 제품 데이터 불러오기
  useEffect(() => {
const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      
      // products와 summary 모두 상태에 저장
      setProducts(Array.isArray(data) ? data : data.products || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('제품 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

    loadProducts();
  }, []);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('정말 이 품목을 삭제하시겠습니까?')) return;

    try {
      await deleteProduct(productId);
      // 삭제 성공 시 상태(state)에서 해당 제품을 필터링하여 UI 즉시 반영
      setProducts((prevProducts) => 
        prevProducts.filter((product) => 
          (product.product_id || product.id) !== productId)
      );
    } catch (error) {
      alert('제품 삭제 중 오류가 발생했습니다.');
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'HEALTHY': return { text: '여유', className: 'status-여유' };
      case 'WARNING': return { text: '임박', className: 'status-임박' };
      case 'DEPLETED': return { text: '소진', className: 'status-소진' };
      case 'EXPIRED': return { text: '폐기', className: 'status-폐기' };
      default: return { text: status, className: '' };
    }
  };

  const handleDepleteProduct = async (productId) => {
    if (!window.confirm('이 품목을 소진 처리하시겠습니까?')) return;

    try {
      // 오늘 날짜를 YYYY-MM-DD 형식으로 생성
      const today = new Date().toISOString().split('T')[0];
      
      await depleteProduct(productId, today);
      
      // 성공 시 상태를 업데이트하여 화면의 상태나 목록을 즉시 갱신 (예: 상태를 '소진'으로 변경)
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          (product.product_id || product.id) === productId
            ? { ...product, status: '소진' }
            : product
        )
      );
    } catch (error) {
      alert('제품 소진 처리 중 오류가 발생했습니다.');
    }
  };

  // dday 숫자를 받아 화면 표시용 문자열로 변환하는 함수
  const formatDday = (dday) => {
    if (dday === null || dday === undefined) return '';
    
    // 0인 경우는 정확히 "D-day"로 표시
    if (dday === 0) {
      return 'D-day';
    }
    
    // 양수일 때 (예: 31 -> D-31)
    if (dday > 0) {
      return `D-${dday}`;
    }
    
    // 음수일 때 (예: -3 -> D+3 또는 기한 경과 표현)
    return `D+${Math.abs(dday)}`;
  };

  return (
    <Layout>
      <main className="page-container products-page">
        {/* 재고 알림 헤더 */}
        <div className="page-section-header">
          <h2 className="page-section-title">재고 알림</h2>
        </div>

        {/* 상단 요약 카드 */}
        <section className="products-section">
          <div className="surface-box">
            <div className="products-summary">
              <div className="products-summary-card summary-expired">
                <div className="products-summary-content">
                  <p>소비기한 지남</p>
                  <h2>품목 {summary.expired_count}개</h2>
                  <span>즉시 확인 필요</span>
                </div>
                <FontAwesomeIcon className="products-summary-icon" icon={faTrashCan} />
              </div>

              <div className="products-summary-card summary-warning">
                <div className="products-summary-content">
                  <p>소비기한 임박</p>
                  <h2>품목 {summary.warning_count}개</h2>
                  <span>소비 권장</span>
                </div>
                <FontAwesomeIcon className="products-summary-icon" icon={faTriangleExclamation} />
              </div>

              {/* AI 소진 예측 및 공구 추천 카드 */}
              {summary.recommended_items && summary.recommended_items.length > 0 ? (
                summary.recommended_items.slice(0,2).map((item) => (
                  <div key={item.product_id} className="products-summary-card summary-ai">
                    <div className="products-summary-content">
                      <p>AI 소진 예측</p>
                      <h2>{item.product_name}</h2>
                      <span>이웃과 공구 추천</span>
                    </div>
                    <FontAwesomeIcon className="products-summary-icon" icon={faCartShopping} />
                  </div>
                ))
              ) : (
                /* 추천 품목이 없을 경우 대체 뷰 */
                <div className="products-summary-card summary-ai">
                  <div className="products-summary-content">
                    <p>AI 소진 예측</p>
                    <h2>없음</h2>
                    <span>모든 품목 여유로움</span>
                  </div>
                  <FontAwesomeIcon className="products-summary-icon" icon={faCartShopping} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 재고 관리 헤더 */}
        <div className="page-section-header">
          <h2 className="page-section-title">재고 관리</h2>
        </div>

        {/* 카테고리 탭 · 검색 · 재고 품목 테이블 */}
        <section className="products-section">
          <div className="surface-box">
            {/* 카테고리 탭 및 품목 검색 */}
            <div className="products-controls">
              <div className="products-tabs">
                <button type="button" className="products-tab products-tab-active">
                  전체 ({products.length})
                </button>
                <button type="button" className="products-tab">
                  식료품 (3)
                </button>
                <button type="button" className="products-tab">
                  생필품 (2)
                </button>
              </div>

              <div className="products-search-box">
                <FontAwesomeIcon className="products-search-icon" icon={faMagnifyingGlass} />
                <input
                  type="search"
                  className="products-search"
                  placeholder="품목 검색"
                  aria-label="품목 검색"
                  readOnly
                />
              </div>
            </div>

            {/* 재고 품목 목록 테이블 */}
            <div className="products-list">
              {loading ? (
                <p className="products-loading">데이터를 불러오는 중입니다...</p>
              ) : (
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>카테고리</th>
                      <th>세부 카테고리</th>
                      <th>상태</th>
                      <th>상품명</th>
                      <th>기간</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="products-empty">등록된 품목이 없습니다.</td>
                      </tr>
                    ) : (
                      products
                        .slice()
                        .sort((a, b) => new Date(a.product_date) - new Date(b.product_date))
                        .map((product) => (
                          <tr key={product.product_id || product.id}>
                            <td>{product.category}</td>
                            <td>{product.subcategory}</td>
                            <td>
                              {(() => {
                                const { text, className } = getStatusLabel(product.status);
                                return (
                                  <span className={`products-status ${className}`}>
                                    {text}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="products-name">{product.product_name}</td>
                            <td className="products-date">
                              <span>{product.product_date?.replaceAll('-', '.')}</span>
                              <span>{formatDday(product.dday)}</span>
                            </td>
                            <td>
                              <div className="products-action-buttons">
                                <button 
                                  type="button" 
                                  className="products-deplet"
                                  onClick={() => handleDepleteProduct(product.product_id || product.id)}
                                >                                  
                                  소진
                                </button>
                                <button 
                                  type="button" 
                                  className="products-delete"
                                  onClick={() => handleDeleteProduct(product.product_id || product.id)}
                                >
                                  삭제
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* 하단 중앙 영수증 인식 플로팅 버튼 */}
      <div className="products-upload">
        {uploadOpen && (
          <div className="products-upload-menu">
            <button
              type="button"
              className="products-upload-option"
              onClick={() => {
                setUploadOpen(false);
                setOcrModalOpen(true);
              }}
            >
              <span className="products-upload-folder">
                <FontAwesomeIcon icon={faFolderOpen} />
              </span>

              <span className="products-upload-text">
                <strong>내 PC에서 파일 선택</strong>
                <small>영수증 이미지/PDF 파일 업로드</small>
              </span>
            </button>
          </div>
        )}

        <button
          type="button"
          className="products-upload-button"
          aria-expanded={uploadOpen}
          onClick={() => setUploadOpen(!uploadOpen)}
        >
          <span>영수증 인식</span>
          <FontAwesomeIcon icon={uploadOpen ? faChevronUp : faChevronDown} />
        </button>
      </div>

      {/* 영수증 OCR 결과 모달 */}
      {ocrModalOpen && (
        <ReceiptOCRModal onClose={() => setOcrModalOpen(false)} />
      )}
    </Layout>
  );
}