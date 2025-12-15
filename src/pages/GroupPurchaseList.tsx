import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { groupPurchaseAPI } from '@/utils/api';
import { getCurrentUserId } from '@/utils/auth';
import './GroupPurchaseList.css';

export default function GroupPurchaseList() {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<'all' | 'my'>('all');
  const [allMyGPs, setAllMyGPs] = useState<any[]>([]);
  const [myGPLoading, setMyGPLoading] = useState(false);
  const size = 10;
  const userId = getCurrentUserId();

  const { data, isLoading, error } = useQuery(
    ['group-purchases', page],
    () => groupPurchaseAPI.getList(page, size),
    {
      keepPreviousData: true,
      enabled: filter === 'all',
    }
  );

  // "내 공동구매" 필터일 때 모든 페이지를 가져와서 필터링
  useEffect(() => {
    if (filter === 'my' && userId !== null) {
      setMyGPLoading(true);
      const fetchAllMyGPs = async () => {
        const allGPs: any[] = [];
        let currentPage = 0;
        let hasMore = true;

        while (hasMore) {
          try {
            const response = await groupPurchaseAPI.getList(currentPage, 100); // 큰 사이즈로 가져오기
            const myGPs = response.content.filter((gp) => gp.hostUserId === userId);
            allGPs.push(...myGPs);
            
            if (response.last || response.content.length === 0) {
              hasMore = false;
            } else {
              currentPage++;
            }
          } catch (err) {
            console.error('공동구매 목록 조회 실패:', err);
            hasMore = false;
          }
        }
        setAllMyGPs(allGPs);
        setMyGPLoading(false);
      };
      fetchAllMyGPs();
    } else {
      setAllMyGPs([]);
    }
  }, [filter, userId]);

  // 필터링된 목록
  const filteredContent = filter === 'my'
    ? allMyGPs
    : data?.content || [];

  // 필터링된 결과의 페이지네이션
  const itemsPerPage = 10;
  const totalFilteredPages = Math.ceil(filteredContent.length / itemsPerPage);
  const currentFilteredPage = filter === 'my' ? page : 0;
  const startIndex = currentFilteredPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContent = filter === 'my'
    ? filteredContent.slice(startIndex, endIndex)
    : filteredContent;

  const displayLoading = filter === 'all' ? isLoading : myGPLoading;
  const displayError = filter === 'all' ? error : null;

  if (displayLoading && filteredContent.length === 0) {
    return <div className="loading">로딩 중...</div>;
  }

  if (displayError) {
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
        {paginatedContent.map((gp) => (
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
      {filteredContent.length === 0 && !displayLoading && (
        <div className="empty">
          {filter === 'my' ? '내 공동구매가 없습니다.' : '공동구매가 없습니다.'}
        </div>
      )}
      {filter === 'all' && data && (
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
      {filter === 'my' && filteredContent.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentFilteredPage === 0}
            className="page-btn"
          >
            이전
          </button>
          <span className="page-info">
            {currentFilteredPage + 1} / {totalFilteredPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={currentFilteredPage >= totalFilteredPages - 1}
            className="page-btn"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

