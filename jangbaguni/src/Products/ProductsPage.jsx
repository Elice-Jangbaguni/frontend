import React, { useState, useEffect, useRef } from 'react';
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
import { fetchProducts, deleteProduct, depleteProduct } from '../API/products';
import { uploadReceipt, getReceiptItems } from '../API/receipt';
import './ProductsPage.css';

export default function ProductsPage() {
  // 상태 관리 
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    expired_count: 0,
    warning_count: 0,
    recommended_items: []
  });
  const [loading, setLoading] = useState(true);  
  const [uploadOpen, setUploadOpen] = useState(false);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [ocrResultData, setOcrResultData] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('전체'); // '전체', '식료품', '생필품'

  // 파일 선택을 위한 숨겨진 input 레퍼런스
  const fileInputRef = useRef(null);

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

  // "내 PC에서 파일 선택" 메뉴 클릭 시 실제 파일창 열기
  const handleFileSelectClick = () => {
    setUploadOpen(false);
    fileInputRef.current?.click();
  };

// 사용자가 파일을 선택했을 때 업로드 후 아이템 조회 API 호출
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      
      // 1. 영수증 업로드 API 호출 (POST /api/receipts/upload)
      const uploadResponse = await uploadReceipt(file);
      console.log('영수증 업로드 성공 응답:', uploadResponse);
      
      // 2. 업로드 응답에서 receipt_id 추출 (예: uploadResponse.receipt_id)
      const receiptId = uploadResponse.receipt_id;

      if (receiptId) {
        // 3. 영수증 아이템 조회 API 호출 (GET /api/receipts/{receipt_id}/items)[cite: 17]
        const itemsResponse = await getReceiptItems(receiptId);
        console.log('영수증 아이템 조회 성공:', itemsResponse);
        
        // 조회된 데이터를 모달 상태로 전달
        setOcrResultData(itemsResponse);
      } else {
        // 만약 receipt_id가 바로 안오고 업로드 응답에 items가 포함된 경우 대안 처리
        setOcrResultData(uploadResponse);
      }
      
      // 4. 모달 열기
      setOcrModalOpen(true);
    } catch (error) {
      console.error('영수증 업로드 또는 아이템 조회 중 오류 발생:', error);
      alert('영수증 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      e.target.value = ''; // 파일 input 초기화
    }
  };

  // 탭 및 검색어로 제품 필터링 계산
  const filteredProducts = products.filter((product) => {
    // 카테고리 탭 필터링
    const matchesTab = 
      selectedTab === '전체' || 
      product.category === selectedTab;

    // 2검색어 필터링
    const matchesSearch = 
      product.product_name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // 카테고리별 개수 동적 계산
  const totalCount = products.length;
  const groceryCount = products.filter(p => p.category === '식료품').length;
  const necessityCount = products.filter(p => p.category === '생필품').length;

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
      {/* 파일 업로드를 위한 숨겨진 input 태그 */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*,application/pdf"
        onChange={handleFileChange}
      />

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
              <button 
                type="button" 
                className={`products-tab ${selectedTab === '전체' ? 'products-tab-active' : ''}`}
                onClick={() => setSelectedTab('전체')}
              >
                전체 ({totalCount})
                </button>
                <button 
                  type="button" 
                  className={`products-tab ${selectedTab === '식료품' ? 'products-tab-active' : ''}`}
                  onClick={() => setSelectedTab('식료품')}
                >
                  식료품 ({groceryCount})
                </button>
                <button 
                  type="button" 
                  className={`products-tab ${selectedTab === '생필품' ? 'products-tab-active' : ''}`}
                  onClick={() => setSelectedTab('생필품')}
                >
                  생필품 ({necessityCount})
                </button>
              </div>
              <div className="products-search-box">
                <FontAwesomeIcon className="products-search-icon" icon={faMagnifyingGlass} />
                <input
                  type="search"
                  className="products-search"
                  placeholder="품목 검색"
                  aria-label="품목 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} // 입력할 때마다 검색어 실시간 반영
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
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="products-empty">검색된 품목이 없습니다.</td>
                    </tr>
                  ) : (
                    filteredProducts
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
              onClick={handleFileSelectClick} // 클릭 시 파일 탐색기 열기 연결
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

      {/* 영수증 OCR 결과 모달 (서버에서 받은 결과 데이터 전달) */}
      {ocrModalOpen && (
        <ReceiptOCRModal 
          initialData={ocrResultData} 
          onClose={() => setOcrModalOpen(false)} 
        />
      )}
    </Layout>
  );
}