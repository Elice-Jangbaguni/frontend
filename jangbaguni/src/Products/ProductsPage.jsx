import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    expired_count: 0,
    warning_count: 0,
    recommended_items: [],
  });
  const [loading, setLoading] = useState(true);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [ocrResultData, setOcrResultData] = useState(null);
  const [currentReceiptId, setCurrentReceiptId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('전체');

  const fileInputRef = useRef(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();

      setProducts(Array.isArray(data) ? data : data.products || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('제품 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleFileSelectClick = () => {
    setUploadOpen(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingReceipt(true);

      const uploadResponse = await uploadReceipt(file);
      console.log('영수증 업로드 성공 응답:', uploadResponse);

      const receiptId = uploadResponse.receipt_id ?? null;
      setCurrentReceiptId(receiptId);

      if (receiptId) {
        const itemsResponse = await getReceiptItems(receiptId);
        console.log('영수증 아이템 조회 성공:', itemsResponse);
        setOcrResultData(itemsResponse);
      } else {
        setOcrResultData(uploadResponse);
      }

      setOcrModalOpen(true);
    } catch (error) {
      console.error('영수증 업로드 또는 아이템 조회 중 오류 발생:', error);
      alert('영수증 처리 중 오류가 발생했습니다.');
    } finally {
      setUploadingReceipt(false);
      e.target.value = '';
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesTab =
      selectedTab === '전체' ||
      product.category === selectedTab;

    const matchesSearch =
      product.product_name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const totalCount = products.length;
  const groceryCount = products.filter((p) => p.category === '식료품').length;
  const necessityCount = products.filter((p) => p.category === '생필품').length;

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('정말 이 품목을 삭제하시겠습니까?')) return;

    try {
      await deleteProduct(productId);
      setProducts((prevProducts) =>
        prevProducts.filter((product) => (product.product_id || product.id) !== productId)
      );
    } catch (error) {
      alert('제품 삭제 중 오류가 발생했습니다.');
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'HEALTHY':
        return { text: '여유', className: 'status-여유' };
      case 'WARNING':
        return { text: '임박', className: 'status-임박' };
      case 'DEPLETED':
        return { text: '소진', className: 'status-소진' };
      case 'EXPIRED':
        return { text: '폐기', className: 'status-폐기' };
      default:
        return { text: status, className: '' };
    }
  };

  const handleDepleteProduct = async (productId) => {
    if (!window.confirm('이 품목을 소진 처리하시겠습니까?')) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      await depleteProduct(productId, today);

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

  const formatDday = (dday) => {
    if (dday === null || dday === undefined) return '';
    if (dday === 0) return 'D-day';
    if (dday > 0) return `D-${dday}`;
    return `D+${Math.abs(dday)}`;
  };

  return (
    <Layout>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*,application/pdf"
        onChange={handleFileChange}
      />

      <main className="page-container products-page">
        <div className="page-section-header">
          <h2 className="page-section-title">재고 알림</h2>
        </div>

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

              {summary.recommended_items && summary.recommended_items.length > 0 ? (
                summary.recommended_items.slice(0, 2).map((item) => (
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

        <div className="page-section-header">
          <h2 className="page-section-title">재고 관리</h2>
        </div>

        <section className="products-section">
          <div className="surface-box">
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

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

      <div className="products-upload">
        {uploadOpen && (
          <div className="products-upload-menu">
            <button
              type="button"
              className="products-upload-option"
              onClick={handleFileSelectClick}
              disabled={uploadingReceipt}
            >
              <span className="products-upload-folder">
                <FontAwesomeIcon icon={faFolderOpen} />
              </span>

              <span className="products-upload-text">
                <strong>내 PC에서 파일 선택</strong>
                <small>
                  {uploadingReceipt ? '영수증 인식 중...' : '영수증 이미지/PDF 파일 업로드'}
                </small>
              </span>
            </button>
          </div>
        )}

        <button
          type="button"
          className="products-upload-button"
          aria-expanded={uploadOpen}
          disabled={uploadingReceipt}
          onClick={() => setUploadOpen(!uploadOpen)}
        >
          <span>{uploadingReceipt ? '인식 중...' : '영수증 인식'}</span>
          <FontAwesomeIcon icon={uploadOpen ? faChevronUp : faChevronDown} />
        </button>
      </div>

      {ocrModalOpen && (
        <ReceiptOCRModal
          initialData={ocrResultData}
          receiptId={currentReceiptId}
          onClose={() => setOcrModalOpen(false)}
          onSuccess={loadProducts}
        />
      )}
    </Layout>
  );
}