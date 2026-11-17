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
import { fetchProducts } from '../API/products';
import './ProductsPage.css';


export default function ProductsPage() {
  // 상태 관리 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);

  // 컴포넌트 마운트 시 제품 데이터 불러오기
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        // 백엔드 응답 데이터 구조에 맞춰 설정
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch (error) {
        console.error('제품 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

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
                  <h2>품목 1개</h2>
                  <span>즉시 확인 필요</span>
                </div>
                <FontAwesomeIcon className="products-summary-icon" icon={faTrashCan} />
              </div>

              <div className="products-summary-card summary-warning">
                <div className="products-summary-content">
                  <p>소비기한 임박</p>
                  <h2>품목 1개</h2>
                  <span>소비 권장</span>
                </div>
                <FontAwesomeIcon className="products-summary-icon" icon={faTriangleExclamation} />
              </div>

              <div className="products-summary-card summary-ai">
                <div className="products-summary-content">
                  <p>AI 소진 예측</p>
                  <h2>키친타올</h2>
                  <span>이웃과 공구 추천</span>
                </div>
                <FontAwesomeIcon className="products-summary-icon" icon={faCartShopping} />
              </div>

              <div className="products-summary-card summary-ai">
                <div className="products-summary-content">
                  <p>AI 소진 예측</p>
                  <h2>세제</h2>
                  <span>이웃과 공구 추천</span>
                </div>
                <FontAwesomeIcon className="products-summary-icon" icon={faCartShopping} />
              </div>
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
                              <span className={`products-status status-${product.status}`}>
                                {product.status}
                              </span>
                            </td>
                            <td className="products-name">{product.product_name}</td>
                            <td className="products-date">
                              <span>{product.product_date?.replaceAll('-', '.')}</span>
                              <span>{product.dday}</span>
                            </td>
                            <td>
                              <div className="products-action-buttons">
                                <button type="button" className="products-deplet" disabled>
                                  소진
                                </button>
                                <button type="button" className="products-delete" disabled>
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