import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Layout from '../Main/Layout';
import CreateGroupBuyModal from './CreateGroupBuyModal';
import ChatFloatingButton from '../Chat/ChatFloatingButton';
import ChatModal from '../Chat/ChatModal';
import {
  getRegionGroupBuyList,
  getMyGroupBuyList,
  createGroupBuy,
} from '../API/groupbuy';
import './GroupBuyPage.css';

const DEFAULT_REGION = '서울특별시 성북구';
const BACKEND_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://jangbaguni-backend.onrender.com';
const FALLBACK_IMAGE =
  'https://thumbnail.coupangcdn.com/thumbnails/remote/640x640ex/image/vendor_inventory/8510/5e1707958f1f47428c08acae84c9999c567455ffb11d7020f8887705d223.jpg';

// 백엔드 상대 경로 이미지 URL을 전체 경로로 변환
const getImageUrl = (imagePath) => {
  if (!imagePath) return FALLBACK_IMAGE;
  if (imagePath.startsWith('http')) return imagePath;
  return `${BACKEND_BASE_URL}${imagePath}`;
};

const getStatusLabel = (status, currentPeople = 1, numberOfPeople = 2) => {
  const current = Number(currentPeople ?? 1);
  const total = Number(numberOfPeople ?? 2);

  if (total > 0 && current >= total) {
    return '모집완료';
  }
  if (status === 'recruiting') {
    return '모집중';
  }
  return '모집중';
};

// 목록 API 응답({ group_buy: [...] } 또는 배열)에서 게시글 배열 추출
const extractPosts = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.group_buy)) return data.group_buy;
  if (Array.isArray(data?.posts)) return data.posts;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export default function GroupBuyPage() {
  const navigate = useNavigate();

  const [region, setRegion] = useState(DEFAULT_REGION);
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMyLoading, setIsMyLoading] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 지역별 공동구매 목록 API 조회 (GET /api/group_buy)
  const fetchGroupBuyList = useCallback(async (targetRegion) => {
    setIsLoading(true);
    try {
      const data = await getRegionGroupBuyList(targetRegion);
      setPosts(extractPosts(data));
    } catch (error) {
      console.error(
        '공구 목록 조회 실패:',
        error.response?.status,
        error.response?.data || error.message
      );
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 내 참여 공동구매 목록 API 조회 (GET /api/group_buy/participants)
  const fetchMyGroupBuyList = useCallback(async () => {
    setIsMyLoading(true);
    try {
      const data = await getMyGroupBuyList();
      setMyPosts(extractPosts(data));
    } catch (error) {
      console.error(
        '참여 중인 공구 조회 실패:',
        error.response?.status,
        error.response?.data || error.message
      );
      setMyPosts([]);
    } finally {
      setIsMyLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroupBuyList(region);
  }, [fetchGroupBuyList, region]);

  useEffect(() => {
    fetchMyGroupBuyList();
  }, [fetchMyGroupBuyList]);

  const handleToDetail = (item) => {
    const buyId = item.group_buy_id ?? item.buy_id ?? item.id;
    navigate('/groupbuy/detail', {
      state: { buyId, groupBuy: item },
    });
  };

  // 공동구매 생성 API 요청 및 목록 갱신 (POST /api/group_buy)
  const handleCreateGroupBuy = async (payload) => {
    setIsSubmitting(true);
    try {
      const data = await createGroupBuy(payload);
      console.log('공구 생성 성공:', data);
      alert('공구가 작성되었습니다!');
      setIsCreateModalOpen(false);
      await Promise.all([
        fetchGroupBuyList(payload.region || region),
        fetchMyGroupBuyList(),
      ]);
    } catch (error) {
      console.error(
        '공구 생성 실패:',
        error.response?.status,
        error.response?.data || error.message
      );
      if (error.response?.status === 422) {
        const detail = error.response.data?.detail?.[0];
        alert(
          `입력 형식 오류 (${detail?.loc?.slice(-1)[0] || ''}): ${
            detail?.msg || '입력값을 확인해 주세요.'
          }`
        );
      } else {
        alert(error.response?.data?.detail || '공구 작성 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCard = (item, keyPrefix) => {
    const buyId = item.group_buy_id ?? item.buy_id ?? item.id;
    const statusRaw = item.group_buy_status ?? item.status;
    const currentPeople = item.current_people ?? 1;
    const numberOfPeople = item.number_of_people ?? 2;
    const statusText = getStatusLabel(statusRaw, currentPeople, numberOfPeople);

    const rawPrice = item.price_per_person ?? item.price;
    const formattedPrice =
      typeof rawPrice === 'number'
        ? rawPrice.toLocaleString('ko-KR')
        : rawPrice;

    const place = item.pickup_place ?? item.place ?? '';

    return (
      <div
        className={`groupbuy-card ${keyPrefix === 'part' ? 'slider-card' : ''}`}
        key={`${keyPrefix}-${buyId ?? item.product_name}`}
        onClick={() => handleToDetail(item)}
      >
        <div className="image-wrapper">
          <span className="status-badge">
            {statusText} ({currentPeople}/{numberOfPeople}명)
          </span>
          <img
            src={getImageUrl(item.product_image_path)}
            alt={item.product_name}
            className="product-image"
          />
        </div>
        <div className="card-content">
          <h3 className="product-title">{item.product_name}</h3>
          <p className="product-price">
            <strong>{formattedPrice}</strong> 원
          </p>
          <p className="product-place">
            <span className="place-icon">📍</span> {place}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <main className="page-container">
        <div className="page-section-header">
          <h2 className="page-section-title">참여 중인 공구</h2>
          <button className="create-btn" onClick={() => setIsCreateModalOpen(true)}>
            <FontAwesomeIcon icon={faPlus} />
            공구 열기
          </button>
        </div>

        <section className="groupbuy-section">
          <div className="surface-box">
            {isMyLoading ? (
              <p className="loading-text">참여 중인 공구를 불러오는 중...</p>
            ) : myPosts.length === 0 ? (
              <p className="empty-text">참여 중인 공구가 없습니다.</p>
            ) : (
              <div className="card-slider">
                {myPosts.map((item) => renderCard(item, 'part'))}
              </div>
            )}
          </div>
        </section>

        <div className="page-section-header">
          <div className="page-section-title-group">
            <h2 className="page-section-title">우리 동네 공구</h2>
            <span className="location-tag">{region}</span>
          </div>
        </div>

        <section className="groupbuy-section">
          <div className="surface-box">
            {isLoading ? (
              <p className="loading-text">공구 목록을 불러오는 중...</p>
            ) : posts.length === 0 ? (
              <p className="empty-text">우리 동네에 진행 중인 공구가 없습니다.</p>
            ) : (
              <div className="card-grid">
                {posts.map((item) => renderCard(item, 'neigh'))}
              </div>
            )}
          </div>
        </section>
      </main>

      <CreateGroupBuyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGroupBuy}
        isSubmitting={isSubmitting}
      />

      <ChatFloatingButton onClick={() => setIsChatOpen(true)} />
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </Layout>
  );
}