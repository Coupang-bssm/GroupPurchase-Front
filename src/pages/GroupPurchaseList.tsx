import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { groupPurchaseAPI } from '@/utils/api';
import { getCurrentUserId } from '@/utils/auth';
import './GroupPurchaseList.css';

export default function GroupPurchaseList() {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<'all' | 'my'>('all');
  const size = 10;
  const userId = getCurrentUserId();

  const { data, isLoading, error } = useQuery(
    ['group-purchases', page],
    () => groupPurchaseAPI.getList(page, size),
    {
      keepPreviousData: true,
    }
  );

  // 필터링된 목록
  const filteredContent = filter === 'my' && userId !== null
    ? data?.content.filter((gp) => gp.hostUserId === userId) || []
    : data?.content || [];

  if (isLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="error">공동구매 목록을 불러오는데 실패했습니다.</div>;
  }

  return (
    <div className="group-purchase-list">
      <div className="list-header">
        <h1>공동구매 목록</h1>
        <div className="header-actions">
          <div className="filter-tabs">
            <button
              className={filter === 'all' ? 'active' : ''}
              onClick={() => {
                setFilter('all');
                setPage(0);
              }}
            >
              전체
            </button>
            <button
              className={filter === 'my' ? 'active' : ''}
              onClick={() => {
                setFilter('my');
                setPage(0);
              }}
            >
              내 공동구매
            </button>
          </div>
          <Link to="/group-purchases/create" className="create-btn">
            공동구매 열기
          </Link>
        </div>
      </div>
      <div className="gp-grid">
        {filteredContent.map((gp) => (
          <Link key={gp.id} to={`/group-purchases/${gp.id}`} className="gp-card">
            <div className="gp-header">
              <h3>{gp.title}</h3>
              <span className={`status status-${gp.status.toLowerCase()}`}>
                {gp.status === 'OPEN' ? '진행중' : gp.status === 'CLOSED' ? '마감' : '완료'}
              </span>
            </div>
            <p className="gp-description">{gp.description}</p>
            <div className="gp-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min((gp.currentCount / gp.targetCount) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="progress-text">
                {gp.currentCount} / {gp.targetCount}명
              </p>
            </div>
            <div className="gp-meta">
              <p>마감일: {new Date(gp.deadline).toLocaleDateString('ko-KR')}</p>
            </div>
          </Link>
        ))}
      </div>
      {filteredContent.length === 0 && !isLoading && (
        <div className="empty">
          {filter === 'my' ? '내 공동구매가 없습니다.' : '공동구매가 없습니다.'}
        </div>
      )}
      {data && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={data.first}
            className="page-btn"
          >
            이전
          </button>
          <span className="page-info">
            {data.number + 1} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={data.last}
            className="page-btn"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

