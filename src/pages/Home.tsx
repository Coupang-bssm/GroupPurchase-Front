import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <h1>환영합니다!</h1>
      <div className="home-links">
        <Link to="/products" className="home-link">
          <h2>상품 목록</h2>
          <p>모든 상품을 확인하세요</p>
        </Link>
        <Link to="/group-purchases" className="home-link">
          <h2>공동구매</h2>
          <p>공동구매에 참여하세요</p>
        </Link>
      </div>
    </div>
  );
}

