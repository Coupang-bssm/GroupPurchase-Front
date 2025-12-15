import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { groupPurchaseAPI, productAPI } from '@/utils/api';
import { getCurrentUserId } from '@/utils/auth';
import CommentSection from '@/components/CommentSection';
import './GroupPurchaseDetail.css';

export default function GroupPurchaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const gpId = parseInt(id || '0', 10);
  const userId = getCurrentUserId();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    targetCount: '',
    deadline: '',
    status: 'OPEN' as 'OPEN' | 'CLOSED' | 'COMPLETED',
  });

  const { data: gp, isLoading: gpLoading } = useQuery(
    ['group-purchase', gpId],
    () => groupPurchaseAPI.getById(gpId),
    {
      enabled: !!gpId,
      onSuccess: (data) => {
        if (data) {
          setEditForm({
            title: data.title,
            description: data.description,
            targetCount: data.targetCount.toString(),
            deadline: data.deadline.slice(0, 16),
            status: data.status,
          });
        }
      },
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

  const updateMutation = useMutation(
    (data: { title?: string; description?: string; targetCount?: number; deadline?: string; status?: 'OPEN' | 'CLOSED' | 'COMPLETED' }) =>
      groupPurchaseAPI.update(gpId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['group-purchase', gpId]);
        setIsEditing(false);
      },
    }
  );

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

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: {
      title?: string;
      description?: string;
      targetCount?: number;
      deadline?: string;
      status?: 'OPEN' | 'CLOSED' | 'COMPLETED';
    } = {};

    if (editForm.title !== gp?.title) updateData.title = editForm.title;
    if (editForm.description !== gp?.description) updateData.description = editForm.description;
    if (parseInt(editForm.targetCount, 10) !== gp?.targetCount) {
      updateData.targetCount = parseInt(editForm.targetCount, 10);
    }
    if (editForm.deadline !== gp?.deadline.slice(0, 16)) {
      // datetime-local 형식(yyyy-MM-ddTHH:mm)을 ISO 형식(yyyy-MM-ddTHH:mm:ss)으로 변환
      const deadlineDate = new Date(editForm.deadline);
      if (!isNaN(deadlineDate.getTime())) {
        updateData.deadline = deadlineDate.toISOString().slice(0, 19);
      }
    }
    if (editForm.status !== gp?.status) updateData.status = editForm.status;

    if (Object.keys(updateData).length > 0) {
      updateMutation.mutate(updateData);
    } else {
      setIsEditing(false);
    }
  };

  if (gpLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!gp) {
    return <div className="error">공동구매를 찾을 수 없습니다.</div>;
  }

  // userId와 hostUserId를 모두 숫자로 변환하여 비교
  const isHost = userId !== null && Number(gp.hostUserId) === Number(userId);
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
                {!isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(true)} className="edit-btn">
                      수정
                    </button>
                    <button onClick={handleCreateInviteLink} className="invite-btn">
                      참여 링크 생성
                    </button>
                    <button onClick={handleDelete} className="delete-btn" disabled={deleteMutation.isLoading}>
                      {deleteMutation.isLoading ? '삭제 중...' : '공동구매 삭제'}
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleEditSubmit} className="edit-gp-form">
                    <div className="form-group">
                      <label htmlFor="edit-title">제목</label>
                      <input
                        type="text"
                        id="edit-title"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-description">설명</label>
                      <textarea
                        id="edit-description"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        required
                        rows={3}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-targetCount">목표 인원</label>
                      <input
                        type="number"
                        id="edit-targetCount"
                        value={editForm.targetCount}
                        onChange={(e) => setEditForm({ ...editForm, targetCount: e.target.value })}
                        required
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-deadline">마감일시</label>
                      <input
                        type="datetime-local"
                        id="edit-deadline"
                        value={editForm.deadline}
                        onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-status">상태</label>
                      <select
                        id="edit-status"
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value as 'OPEN' | 'CLOSED' | 'COMPLETED' })
                        }
                        required
                      >
                        <option value="OPEN">진행중</option>
                        <option value="CLOSED">마감</option>
                        <option value="COMPLETED">완료</option>
                      </select>
                    </div>
                    <div className="edit-form-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          if (gp) {
                            setEditForm({
                              title: gp.title,
                              description: gp.description,
                              targetCount: gp.targetCount.toString(),
                              deadline: gp.deadline.slice(0, 16),
                              status: gp.status,
                            });
                          }
                        }}
                        className="cancel-btn"
                      >
                        취소
                      </button>
                      <button type="submit" className="submit-btn" disabled={updateMutation.isLoading}>
                        {updateMutation.isLoading ? '수정 중...' : '수정 완료'}
                      </button>
                    </div>
                  </form>
                )}
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

