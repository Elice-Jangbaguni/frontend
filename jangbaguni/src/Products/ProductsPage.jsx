
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2,
  TriangleAlert,
  ShoppingCart,
  Search,
  FolderOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import Layout from '../Main/Layout';
import './ProductsPage.css';
import ReceiptOCRModal from './ReceiptOCRModal';

// 화면 디자인 확인용 임시 데이터

const products = [
  {
    product_id: 1,
    product_name: '우유',
    category: '식료품',
    subcategory: '유제품',
    product_date: '2026-11-10',
    status: '폐기',
    dday: 'D+2',
  },
  {
    product_id: 2,
    product_name: '계란',
    category: '식료품',
    subcategory: '난류',
    product_date: '2026-11-13',
    status: '임박',
    dday: 'D-1',
  },
  {
    product_id: 3,
    product_name: '사과',
    category: '식료품',
    subcategory: '과일',
    product_date: '2026-11-19',
    status: '여유',
    dday: 'D-7',
  },
  {
    product_id: 4,
    product_name: '세제',
    category: '생필품',
    subcategory: '세탁용품',
    product_date: '2026-11-14',
    status: '임박',
    dday: 'D-2',
  },
  {
    product_id: 5,
    product_name: '키친타올',
    category: '생필품',
    subcategory: '주방용품',
    product_date: '2026-11-11',
    status: '소진',
    dday: 'D+1',
  },
];

export default function ProductsPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);

  return (
    <Layout>
      <main className="products-page">

        {/* 상단 요약 카드 */}
        <section className="products-summary">

          <div className="products-summary-card summary-expired">
            <div className="products-summary-content">
              <p>소비기한 지남</p>
              <h2>품목 1개</h2>
              <span>즉시 확인 필요</span>
            </div>
            <Trash2 className="products-summary-icon" />
          </div>

          <div className="products-summary-card summary-warning">
            <div className="products-summary-content">
              <p>소비기한 임박</p>
              <h2>품목 1개</h2>
              <span>소비 권장</span>
            </div>
            <TriangleAlert className="products-summary-icon" />
          </div>

          <div className="products-summary-card summary-ai">
            <div className="products-summary-content">
              <p>AI 소진 예측</p>
              <h2>키친타올</h2>
              <span>이웃과 공구 추천</span>
            </div>
            <ShoppingCart className="products-summary-icon" />
          </div>

          <div className="products-summary-card summary-ai">
            <div className="products-summary-content">
              <p>AI 소진 예측</p>
              <h2>세제</h2>
              <span>이웃과 공구 추천</span>
            </div>
            <ShoppingCart className="products-summary-icon" />
          </div>

        </section>

        {/* 카테고리 및 검색 */}
        <section className="products-controls">
          <div className="products-tabs">
            <button
              type="button"
              className="products-tab products-tab-active"
            >
              전체 (5)
            </button>

            <button type="button" className="products-tab">
              식료품 (3)
            </button>

            <button type="button" className="products-tab">
              생필품 (2)
            </button>
          </div>

          <div className="products-search-box">
            <Search size={24} className="products-search-icon" />
            <input
              type="search"
              className="products-search"
              placeholder="품목 검색"
              aria-label="품목 검색"
              readOnly
            />
          </div>
        </section>

        {/* 상품 목록 */}
        <section className="products-list">
          <table className="products-table">

            <thead>
              <tr>
                <th>카테고리</th>
                <th>세부 카테고리</th>
                <th>상태</th>
                <th>상품명</th>
                <th>기간</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {products
                .slice()
                .sort((a, b) =>
                  new Date(a.product_date) - new Date(b.product_date)
                )
                .map((product) => (
                  <tr key={product.product_id}>
                    <td>{product.category}</td>

                    <td>{product.subcategory}</td>

                    <td>
                      <span
                        className={`products-status status-${product.status}`}
                      >
                        {product.status}
                      </span>
                    </td>

                    <td className="products-name">
                      {product.product_name}
                    </td>

                    <td className="products-date">
                      <span>
                        {product.product_date.replaceAll('-', '.')}
                      </span>
                      <span>{product.dday}</span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="products-delete"
                        disabled
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>

          </table>
        </section>

      </main>

      {/* 화면 위에 떠 있는 영수증 인식 버튼 */}
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
                <FolderOpen size={30} strokeWidth={2.2} />
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
          {uploadOpen
            ? <ChevronUp size={20} />
            : <ChevronDown size={20} />
          }
        </button>

      </div>

      {ocrModalOpen && (
        <ReceiptOCRModal
          onClose={() => setOcrModalOpen(false)}
        />
      )}
    </Layout>
  );
}
