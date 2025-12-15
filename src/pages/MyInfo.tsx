import { useQuery } from 'react-query';
import { authAPI } from '@/utils/api';
import './MyInfo.css';

export default function MyInfo() {
  const { data: userInfo, isLoading, error } = useQuery('me', authAPI.me, {
    onSuccess: (data) => {
      console.log('내 정보 데이터:', data);
    },
    onError: (err) => {
      console.error('내 정보 조회 실패:', err);
    },
  });

  if (isLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="error">정보를 불러오는데 실패했습니다.</div>;
  }

  if (!userInfo) {
    return <div className="error">정보를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="my-info">
      <h1>내 정보</h1>
      <div className="info-card">
        <div className="info-item">
          <span className="label">ID:</span>
          <span className="value">{userInfo.id || '-'}</span>
        </div>
        <div className="info-item">
          <span className="label">사용자명:</span>
          <span className="value">{userInfo.username || '-'}</span>
        </div>
        <div className="info-item">
          <span className="label">이메일:</span>
          <span className="value">{userInfo.email || '-'}</span>
        </div>
      </div>
    </div>
  );
}

