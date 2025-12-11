import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { groupPurchaseAPI, productAPI, commentAPI } from '@/utils/api';
import { getCurrentUserId } from '@/utils/auth';
import CommentSection from '@/components/CommentSection';
import './GroupPurchaseDetail.css';

export default function GroupPurchaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const gpId = parseInt(id || '0', 10);
  const userId = getCurrentUserId();

  const { data: gp, isLoading: gpLoading } = useQuery(
    ['group-purchase', gpId],
    () => groupPurchaseAPI.getById(gpId),
    {
      enabled: !!gpId,
    }
  );

  const { data: product } = useQuery(
    ['product', gp?.productId],
    () => productAPI.getById(gp!.productId),
    {
      enabled: !!gp?.productId,
    }
  );

  const joinMutation = useMutation(() => groupPurchaseAPI.join(gpId), {
    onSuccess: () => {
      queryClient.invalidateQueries(['group-purchase', gpId]);
      alert('공동구매 참여가 요청되었습니다.');
    },
  });

  const createInviteLinkMutation = useMutation(() => groupPurchaseAPI.createInviteLink(gpId), {
    onSuccess: (link) => {
      navigator.clipboard.writeText(`${window.location.origin}${link}`);
      alert('참여 링크가 클립보드에 복사되었습니다.');
    },
  });

  const deleteMutation = useMutation(() => groupPurchaseAPI.delete(gpId), {
    onSuccess: () => {
      queryClient.invalidateQueries('group-purchases');
      navigate('/group-purchases');
    },
  });

  const handleJoin = () => {
    if (window.confirm('공동구매에 참여하시겠습니까?')) {
      joinMutation.mutate();
    }
  };

  const handleCreateInviteLink = () => {
    createInviteLinkMutation.mutate();
  };

  const handleDelete = () => {
    if (window.confirm('정말 이 공동구매를 삭제하시겠습니까?')) {
      deleteMutation.mutate();
    }
  };

  if (gpLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!gp) {
    return <div className="error">공동구매를 찾을 수 없습니다.</div>;
  }

  const isHost = gp.hostUserId === userId;
  const progressPercent = Math.min((gp.currentCount / gp.targetCount) * 100, 100);

  return (
    <div className="group-purchase-detail">
      <button onClick={() => navigate(-1)} className="back-btn">
        ← 뒤로가기
      </button>
      <div className="gp-detail-content">
        <div className="gp-main">
          <div className="gp-header">
            <h1>{gp.title}</h1>
            <span className={`status status-${gp.status.toLowerCase()}`}>
              {gp.status === 'OPEN' ? '진행중' : gp.status === 'CLOSED' ? '마감' : '완료'}
            </span>
          </div>
          <p className="gp-description">{gp.description}</p>
          <div className="gp-progress-section">
            <div className="progress-header">
              <h3>참여 현황</h3>
              <p className="progress-count">
                {gp.currentCount} / {gp.targetCount}명
              </p>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <div className="gp-info">
            <p>
              <strong>마감일:</strong> {new Date(gp.deadline).toLocaleString('ko-KR')}
            </p>
            <p>
              <strong>생성일:</strong> {new Date(gp.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
          {product && (
            <div className="product-info">
              <h3>관련 상품</h3>
              <Link to={`/products/${product.id}`} className="product-link">
                <img src={product.imageUrl} alt={product.name} className="product-thumb" />
                <div>
                  <p className="product-name">{product.name}</p>
                  <p className="product-price">{product.price.toLocaleString()}원</p>
                </div>
              </Link>
            </div>
          )}
          <div className="gp-actions">
            {!isHost && gp.status === 'OPEN' && (
              <button onClick={handleJoin} className="join-btn" disabled={joinMutation.isLoading}>
                {joinMutation.isLoading ? '참여 중...' : '공동구매 참여'}
              </button>
            )}
            {isHost && (
              <>
                <button onClick={handleCreateInviteLink} className="invite-btn">
                  참여 링크 생성
                </button>
                <button onClick={handleDelete} className="delete-btn" disabled={deleteMutation.isLoading}>
                  {deleteMutation.isLoading ? '삭제 중...' : '공동구매 삭제'}
                </button>
              </>
            )}
          </div>
          <div className="gp-comments">
            <CommentSection gpId={gpId} />
          </div>
        </div>
      </div>
    </div>
  );
}

