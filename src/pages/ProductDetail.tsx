import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { productAPI } from '@/utils/api';
import { getCurrentUserRole } from '@/utils/auth';
import { getErrorMessage, extractErrorResponse } from '@/utils/errorHandler';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productId = parseInt(id || '0', 10);
  const role = getCurrentUserRole();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
  });

  const { data: product, isLoading } = useQuery(
    ['product', productId],
    () => productAPI.getById(productId),
    {
      enabled: !!productId,
      onSuccess: (data) => {
        if (data) {
          setEditForm({
            name: data.name,
            description: data.description,
            price: data.price.toString(),
            imageUrl: data.imageUrl,
          });
        }
      },
    }
  );

  const updateMutation = useMutation(
    (data: { name?: string; description?: string; price?: number; imageUrl?: string }) =>
      productAPI.update(productId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['product', productId]);
        queryClient.invalidateQueries('products');
        setIsEditing(false);
        alert('상품이 수정되었습니다.');
      },
    }
  );

  const deleteMutation = useMutation(
    () => productAPI.delete(productId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        navigate('/products');
      },
      onError: (error: unknown) => {
        const errorResponse = extractErrorResponse(error);
        
        // 500 에러인 경우 공동구매 관련 에러로 간주
        if (errorResponse.status === 500) {
          alert('해당 상품은 공동구매가 열려있어 삭제할 수 없습니다.\n먼저 관련된 공동구매를 삭제해주세요.');
        } else {
          const errorMessage = getErrorMessage(error, '상품 삭제에 실패했습니다.');
          alert(errorMessage);
        }
      },
    }
  );

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: {
      name?: string;
      description?: string;
      price?: number;
      imageUrl?: string;
    } = {};

    if (editForm.name !== product?.name) updateData.name = editForm.name;
    if (editForm.description !== product?.description) updateData.description = editForm.description;
    const price = parseInt(editForm.price, 10);
    if (!isNaN(price) && price !== product?.price) {
      updateData.price = price;
    }
    if (editForm.imageUrl !== product?.imageUrl) updateData.imageUrl = editForm.imageUrl;

    if (Object.keys(updateData).length > 0) {
      updateMutation.mutate(updateData);
    } else {
      setIsEditing(false);
    }
  };

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
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="edit-product-form">
              <div className="form-group">
                <label htmlFor="edit-name">상품명</label>
                <input
                  type="text"
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-description">상품 설명</label>
                <textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  required
                  rows={5}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-price">가격</label>
                <input
                  type="number"
                  id="edit-price"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-imageUrl">이미지 URL</label>
                <input
                  type="url"
                  id="edit-imageUrl"
                  value={editForm.imageUrl}
                  onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  required
                />
              </div>
              <div className="edit-form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    if (product) {
                      setEditForm({
                        name: product.name,
                        description: product.description,
                        price: product.price.toString(),
                        imageUrl: product.imageUrl,
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
          ) : (
            <>
              <h1>{product.name}</h1>
              <p className="detail-description">{product.description}</p>
              <p className="detail-price">{product.price.toLocaleString()}원</p>
              <div className="detail-meta">
                <p>등록일: {new Date(product.createdAt).toLocaleDateString('ko-KR')}</p>
                <p>수정일: {new Date(product.updatedAt).toLocaleDateString('ko-KR')}</p>
              </div>
              {role === 'ADMIN' && (
                <div className="product-actions">
                  <button onClick={() => setIsEditing(true)} className="edit-btn">
                    수정
                  </button>
                  <button onClick={handleDelete} className="delete-btn" disabled={deleteMutation.isLoading}>
                    {deleteMutation.isLoading ? '삭제 중...' : '상품 삭제'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

