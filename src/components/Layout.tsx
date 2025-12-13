import { Outlet, Link, useNavigate } from 'react-router-dom';
import { authAPI } from '@/utils/api';
import { getCurrentUserRole } from '@/utils/auth';
import './Layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const role = getCurrentUserRole();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 에러가 발생해도 로컬 스토리지 정리 후 로그인 페이지로 이동
      navigate('/login');
    }
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            Coupang
          </Link>
          <nav className="nav">
            <Link to="/products">상품 목록</Link>
            <Link to="/group-purchases">공동구매</Link>
            {role === 'ADMIN' && <Link to="/products/create">상품 등록</Link>}
            <Link to="/my-info">내 정보</Link>
            <button onClick={handleLogout} className="logout-btn">
              로그아웃
            </button>
          </nav>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

