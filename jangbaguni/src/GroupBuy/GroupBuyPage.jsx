import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import Layout from '../Main/Layout';
import AlertModal from '../Main/AlertModal';
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
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL

const resolveImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  if (imagePath.startsWith('/')) {
    return `${BACKEND_BASE_URL}${imagePath}`;
  }
  return imagePath;
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
  const location = useLocation();
  const neighborhoodSectionRef = useRef(null);

  const [region, setRegion] = useState(DEFAULT_REGION);
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchKeyword || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isMyLoading, setIsMyLoading] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (location.state?.searchKeyword !== undefined) {
      setSearchTerm(location.state.searchKeyword || '');
    }
    if (location.state?.scrollTo === 'neighborhood-groupbuy') {
      neighborhoodSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.state]);

  // 지역별 공동구매 목록 API 조회 (GET /api/group_buy)
  const fetchGroupBuyList = useCallback(async (targetRegion) => {
    setIsLoading(true);
    try {
      const data = await getRegionGroupBuyList(targetRegion);
      setPosts(extractPosts(data));
    } catch (error) {
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

  const filteredPosts = posts.filter((item) => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return true;

    const productName = (item.product_name ?? '').toLowerCase();
    const place = (item.pickup_place ?? item.place ?? '').toLowerCase();
    return productName.includes(keyword) || place.includes(keyword);
  });

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
      await createGroupBuy(payload);
      setIsCreateModalOpen(false);
      setAlertMessage('공구가 작성되었습니다!');
      await Promise.all([
        fetchGroupBuyList(payload.region || region),
        fetchMyGroupBuyList(),
      ]);
    } catch (error) {
      if (error.response?.status === 422) {
        const detail = error.response.data?.detail?.[0];
        setAlertMessage(
          `입력 형식 오류 (${detail?.loc?.slice(-1)[0] || ''}): ${
            detail?.msg || '입력값을 확인해 주세요.'
          }`
        );
      } else {
        setAlertMessage(error.response?.data?.detail || '공구 작성 중 오류가 발생했습니다.');
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
    const imageUrl = resolveImageUrl(item.product_image_path);

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
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.product_name}
              className="product-image"
            />
          ) : (
            <div className="product-image image-placeholder" />
          )}
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

        <div className="page-section-header" ref={neighborhoodSectionRef}>
          <div className="page-section-title-group">
            <h2 className="page-section-title">우리 동네 공구</h2>
            <span className="location-tag">{region}</span>
          </div>

          <div className="groupbuy-search-box">
            <FontAwesomeIcon className="groupbuy-search-icon" icon={faMagnifyingGlass} />
            <input
              type="search"
              className="groupbuy-search"
              placeholder="품목 검색"
              aria-label="품목 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <section className="groupbuy-section">
          <div className="surface-box">
            {isLoading ? (
              <p className="loading-text">공구 목록을 불러오는 중...</p>
            ) : filteredPosts.length === 0 ? (
              <p className="empty-text">
                {searchTerm
                  ? `"${searchTerm}"에 해당하는 우리 동네 공구가 없습니다.`
                  : '우리 동네에 진행 중인 공구가 없습니다.'}
              </p>
            ) : (
              <div className="card-grid">
                {filteredPosts.map((item) => renderCard(item, 'neigh'))}
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

      <AlertModal
        open={Boolean(alertMessage)}
        message={alertMessage}
        onConfirm={() => setAlertMessage('')}
      />
    </Layout>
  );
}