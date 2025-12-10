import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { productAPI } from '@/utils/api';
import { getCurrentUserRole, getCurrentUserId } from '@/utils/auth';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productId = parseInt(id || '0', 10);
  const role = getCurrentUserRole();
  const userId = getCurrentUserId();

  const { data: product, isLoading } = useQuery(
    ['product', productId],
    () => productAPI.getById(productId),
    {
      enabled: !!productId,
    }
  );

  const deleteMutation = useMutation(
    () => productAPI.delete(productId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        navigate('/products');
      },
    }
  );

  const handleDelete = () => {
    if (window.confirm('정말 이 상품을 삭제하시겠습니까?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!product) {
    return <div className="error">상품을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="product-detail">
      <button onClick={() => navigate(-1)} className="back-btn">
        ← 뒤로가기
      </button>
      <div className="product-detail-content">
        <img src={product.imageUrl} alt={product.name} className="detail-image" />
        <div className="detail-info">
          <h1>{product.name}</h1>
          <p className="detail-description">{product.description}</p>
          <p className="detail-price">{product.price.toLocaleString()}원</p>
          <div className="detail-meta">
            <p>등록일: {new Date(product.createdAt).toLocaleDateString('ko-KR')}</p>
            <p>수정일: {new Date(product.updatedAt).toLocaleDateString('ko-KR')}</p>
          </div>
          {role === 'ADMIN' && (
            <button onClick={handleDelete} className="delete-btn" disabled={deleteMutation.isLoading}>
              {deleteMutation.isLoading ? '삭제 중...' : '상품 삭제'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

