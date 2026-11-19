import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../Main/Layout';
import AlertModal from '../Main/AlertModal';
import EditGroupBuyModal from './EditGroupBuyModal';
import ChatFloatingButton from '../Chat/ChatFloatingButton';
import ChatModal from '../Chat/ChatModal';
import {
  getGroupBuyDetail,
  updateGroupBuy,
  deleteGroupBuy,
  joinGroupBuy,
} from '../API/groupbuy';
import './GroupBuyDetailPage.css';

const BACKEND_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://jangbaguni-backend.onrender.com';
const FALLBACK_IMAGE =
  'https://thumbnail.coupangcdn.com/thumbnails/remote/657x657q90trim/image/retail/images/92420907427591-1d313b60-ec44-4332-a2e6-7a246473bb4c.jpg';

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

const formatUploadedDate = (rawDate) => {
  if (!rawDate) return '';
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    const str = String(rawDate).replace('T', ' ');
    return str.slice(0, 16).replace(/-/g, '.');
  }
  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, '0');
  const dd = String(parsed.getDate()).padStart(2, '0');
  const hh = String(parsed.getHours()).padStart(2, '0');
  const min = String(parsed.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
};

// 상세/수정 API 응답 필드를 화면 렌더링용 상태로 매핑
const mapDetailResponse = (data) => {
  const statusRaw = data?.status ?? data?.group_buy_status;
  const currentPeople = data?.current_people ?? 1;
  const numberOfPeople = data?.number_of_people ?? 2;
  const statusText = getStatusLabel(statusRaw, currentPeople, numberOfPeople);

  const rawPrice = data?.price ?? data?.price_per_person;
  const formattedPrice =
    typeof rawPrice === 'number'
      ? rawPrice.toLocaleString('ko-KR')
      : String(rawPrice ?? '');

  return {
    id: data?.buy_id ?? data?.group_buy_id ?? data?.id ?? null,
    userId: data?.user_id ?? null,
    username: typeof data?.username === 'string' ? data.username.trim() : '',
    isOwner: Boolean(data?.is_owner),
    region: data?.region || '서울특별시 성북구',
    currentPeople,
    numberOfPeople,
    badge: `${statusText} (${currentPeople}/${numberOfPeople}명)`,
    title: data?.product_name || '',
    price: formattedPrice,
    location: data?.place ?? data?.pickup_place ?? '',
    imageUrl: getImageUrl(data?.product_image_path),
    uploadedDate: formatUploadedDate(data?.uploaded_date),
    description: data?.description || '',
  };
};

export default function GroupBuyDetailPage() {
  const navigate = useNavigate();
  const { buyId: paramBuyId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const rawInitialBuyId =
    paramBuyId ??
    searchParams.get('buyId') ??
    location.state?.buyId ??
    location.state?.groupBuy?.buy_id ??
    location.state?.groupBuy?.group_buy_id ??
    location.state?.groupBuy?.id;

  const initialBuyId =
    rawInitialBuyId !== undefined &&
    rawInitialBuyId !== null &&
    rawInitialBuyId !== '' &&
    !Number.isNaN(Number(rawInitialBuyId))
      ? Number(rawInitialBuyId)
      : null;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(initialBuyId));
  const [isDetailFetched, setIsDetailFetched] = useState(!initialBuyId);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [alertState, setAlertState] = useState({ message: '', redirectTo: '' });

  const [detailData, setDetailData] = useState(() =>
    location.state?.groupBuy
      ? {
          ...mapDetailResponse(location.state.groupBuy),
          username:
            typeof location.state.groupBuy?.username === 'string'
              ? location.state.groupBuy.username.trim()
              : '',
        }
      : {
          id: initialBuyId,
          userId: null,
          username: '',
          isOwner: false,
          region: '서울특별시 성북구',
          currentPeople: 1,
          numberOfPeople: 2,
          badge: '모집중 (1/2명)',
          title: '',
          price: '',
          location: '',
          imageUrl: FALLBACK_IMAGE,
          uploadedDate: '',
          description: '',
        }
  );

  // 공동구매 상세 정보 API 조회 (GET /api/group_buy/{buy_id})
  useEffect(() => {
    if (!initialBuyId) return;

    let isMounted = true;
    const fetchDetail = async () => {
      setIsLoading(true);
      setIsDetailFetched(false);
      setErrorMessage('');
      try {
        const data = await getGroupBuyDetail(initialBuyId);
        if (isMounted && data && typeof data === 'object') {
          setDetailData((prev) => ({
            ...prev,
            ...mapDetailResponse(data),
            id: data?.buy_id ?? data?.group_buy_id ?? data?.id ?? initialBuyId,
          }));
          setIsDetailFetched(true);
        }
      } catch (error) {
        if (isMounted) {
          console.error(
            '공구 상세 조회 실패:',
            error.response?.status,
            error.response?.data || error.message
          );
          setErrorMessage(
            error.response?.data?.detail || '공구 상세 정보를 불러오지 못했습니다.'
          );
          setIsDetailFetched(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [initialBuyId]);

  const handleConfirmAlert = () => {
    const targetPath = alertState.redirectTo;
    setAlertState({ message: '', redirectTo: '' });
    if (targetPath) {
      navigate(targetPath, { replace: true });
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  // 공동구매 수정 API 요청 (PUT /api/group_buy/{buy_id})
  const handleUpdateSubmit = async (payload) => {
    const targetId = detailData.id ?? initialBuyId;
    if (!targetId) {
      setAlertState({ message: '공구 ID를 찾을 수 없습니다.', redirectTo: '' });
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await updateGroupBuy(targetId, payload);
      console.log('공구 수정 성공:', updated);

      if (
        updated &&
        typeof updated === 'object' &&
        (updated.buy_id || updated.group_buy_id || updated.id)
      ) {
        setDetailData((prev) => ({
          ...prev,
          ...mapDetailResponse(updated),
        }));
      } else {
        setDetailData((prev) => {
          const nextCurrent = prev.currentPeople ?? 1;
          const nextTotal = payload.number_of_people;
          const nextStatus = getStatusLabel(
            updated?.status ?? updated?.group_buy_status,
            nextCurrent,
            nextTotal
          );

          return {
            ...prev,
            region: payload.region,
            title: payload.product_name,
            price: payload.price.toLocaleString('ko-KR'),
            location: payload.place,
            currentPeople: nextCurrent,
            numberOfPeople: nextTotal,
            badge: `${nextStatus} (${nextCurrent}/${nextTotal}명)`,
            description: payload.description,
          };
        });
      }

      setIsEditModalOpen(false);
      setAlertState({ message: '공구 정보가 수정되었습니다!', redirectTo: '' });
    } catch (error) {
      console.error(
        '공구 수정 실패:',
        error.response?.status,
        error.response?.data || error.message
      );
      if (error.response?.status === 422) {
        const detail = error.response.data?.detail?.[0];
        setAlertState({
          message: `입력 형식 오류 (${detail?.loc?.slice(-1)[0] || ''}): ${
            detail?.msg || '입력값을 확인해 주세요.'
          }`,
          redirectTo: '',
        });
      } else {
        setAlertState({
          message: error.response?.data?.detail || '공구 수정 중 오류가 발생했습니다.',
          redirectTo: '',
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // 공동구매 삭제 API 요청 (DELETE /api/group_buy/{buy_id})
  const handleDelete = async () => {
    const targetId = detailData.id ?? initialBuyId;
    if (!targetId) {
      setAlertState({ message: '공구 ID를 찾을 수 없습니다.', redirectTo: '' });
      return;
    }

    const confirmed = window.confirm('정말 삭제하시겠습니까?');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const deleted = await deleteGroupBuy(targetId);
      console.log('공구 삭제 성공:', deleted);
      setAlertState({ message: '공구가 삭제되었습니다.', redirectTo: '/groupbuy' });
    } catch (error) {
      console.error(
        '공구 삭제 실패:',
        error.response?.status,
        error.response?.data || error.message
      );
      if (error.response?.status === 422) {
        const detail = error.response.data?.detail?.[0];
        setAlertState({
          message: `요청 오류 (${detail?.loc?.slice(-1)[0] || ''}): ${
            detail?.msg || '공구 ID를 확인해 주세요.'
          }`,
          redirectTo: '',
        });
      } else {
        setAlertState({
          message: error.response?.data?.detail || '공구 삭제 중 오류가 발생했습니다.',
          redirectTo: '',
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // 공동구매 참여 등록 API 요청 (POST /api/group_buy/{buy_id}/participants)
  const handleChat = async () => {
    const targetId = detailData.id ?? initialBuyId;
    if (!targetId) {
      setAlertState({ message: '공구 ID를 찾을 수 없습니다.', redirectTo: '' });
      return;
    }

    setIsJoining(true);
    try {
      const joined = await joinGroupBuy(targetId);
      console.log('공구 참여 성공:', joined);

      setDetailData((prev) => {
        const nextCurrent =
          joined?.current_people ??
          (prev.currentPeople < prev.numberOfPeople
            ? prev.currentPeople + 1
            : prev.currentPeople);
        const total = joined?.number_of_people ?? prev.numberOfPeople ?? 2;
        const statusText = getStatusLabel(
          joined?.status ?? joined?.group_buy_status,
          nextCurrent,
          total
        );

        return {
          ...prev,
          currentPeople: nextCurrent,
          numberOfPeople: total,
          badge: `${statusText} (${nextCurrent}/${total}명)`,
        };
      });

      setSelectedChatRoom({
        id: targetId,
        productTitle: detailData.title,
        lastMessage: '',
        updatedAt: '방금 전',
        unreadCount: 0,
        status: '모집중',
      });
      setIsChatOpen(true);
    } catch (error) {
      console.error(
        '공구 참여 실패:',
        error.response?.status,
        error.response?.data || error.message
      );
      setAlertState({
        message: error.response?.data?.detail || '공구 참여 처리 중 오류가 발생했습니다.',
        redirectTo: '',
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleOpenChatList = () => {
    setSelectedChatRoom(null);
    setIsChatOpen(true);
  };

  if (isLoading && !detailData.title) {
    return (
      <Layout>
        <div className="detail-area">
          <p className="loading-text">공구 상세 정보를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (errorMessage && !detailData.title) {
    return (
      <Layout>
        <div className="detail-area">
          <p className="empty-text">{errorMessage}</p>
        </div>
      </Layout>
    );
  }

  const sellerLabel = !isDetailFetched
    ? ''
    : detailData.username
      ? `${detailData.username} 님`
      : detailData.userId !== null && detailData.userId !== undefined
        ? `공구주 #${detailData.userId}`
        : '';

  return (
    <Layout>
      <div className="detail-area">
        <div className="detail-section">
          <div className="detail-left">
            <div className="detail-image-wrapper">
              <img
                src={detailData.imageUrl}
                alt={detailData.title}
                className="detail-product-image"
                onError={(e) => {
                  if (e.currentTarget.src !== FALLBACK_IMAGE) {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }
                }}
              />
            </div>
            {sellerLabel && <div className="seller-badge">{sellerLabel}</div>}
          </div>

          <div className="detail-right">
            <div className="status-badge-detail">{detailData.badge}</div>

            <h1 className="detail-title">{detailData.title}</h1>

            <div className="price-location-row">
              <div className="price-area">
                <span className="price-label">1인당 부담금</span>
                <div className="price-value">
                  <strong>{detailData.price}</strong>원
                </div>
              </div>
              <div className="location-area">
                <span className="location-icon">📍</span> {detailData.location}
              </div>
            </div>

            <hr className="detail-divider" />

            <div className="detail-description">
              {detailData.description.split('\n').map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </div>

            {detailData.uploadedDate && (
              <div className="detail-date">{detailData.uploadedDate}</div>
            )}

            {detailData.isOwner ? (
              <div className="action-button-group">
                <button type="button" className="edit-btn" onClick={handleEdit}>
                  수정
                </button>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="chat-btn"
                onClick={handleChat}
                disabled={isJoining}
              >
                {isJoining ? '참여 중...' : '채팅'}
              </button>
            )}
          </div>
        </div>
      </div>

      <EditGroupBuyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={detailData}
        onSubmit={handleUpdateSubmit}
        isSubmitting={isUpdating}
      />

      <ChatFloatingButton onClick={handleOpenChatList} />
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialRoom={selectedChatRoom}
      />

      <AlertModal
        open={Boolean(alertState.message)}
        message={alertState.message}
        onConfirm={handleConfirmAlert}
      />
    </Layout>
  );
}