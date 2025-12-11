import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { groupPurchaseAPI } from '@/utils/api';
import './GroupPurchaseList.css';

export default function GroupPurchaseList() {
  const [page, setPage] = useState(0);
  const size = 10;

  const { data, isLoading, error } = useQuery(
    ['group-purchases', page],
    () => groupPurchaseAPI.getList(page, size),
    {
      keepPreviousData: true,
    }
  );

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
        <Link to="/group-purchases/create" className="create-btn">
          공동구매 열기
        </Link>
      </div>
      <div className="gp-grid">
        {data?.content.map((gp) => (
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
      {data && data.content.length === 0 && (
        <div className="empty">공동구매가 없습니다.</div>
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

