import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { groupPurchaseAPI, productAPI } from '@/utils/api';
import './GroupPurchaseCreate.css';

export default function GroupPurchaseCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    productId: '',
    title: '',
    description: '',
    targetCount: '',
    deadline: '',
  });
  const [error, setError] = useState('');

  // 상품 목록 조회 (드롭다운용)
  const { data: products } = useQuery('products-for-gp', () => productAPI.getList(undefined, 100));

  const createMutation = useMutation(
    (data: {
      productId: number;
      title: string;
      description: string;
      targetCount: number;
      deadline: string;
    }) => groupPurchaseAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('group-purchases');
        alert('공동구매가 생성되었습니다.');
        navigate('/group-purchases');
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || '공동구매 생성에 실패했습니다.');
      },
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const productId = parseInt(formData.productId, 10);
    const targetCount = parseInt(formData.targetCount, 10);

    if (isNaN(productId) || productId <= 0) {
      setError('상품을 선택해주세요.');
      return;
    }

    if (isNaN(targetCount) || targetCount <= 0) {
      setError('목표 인원은 1명 이상이어야 합니다.');
      return;
    }

    if (new Date(formData.deadline) <= new Date()) {
      setError('마감일은 현재 시간 이후여야 합니다.');
      return;
    }

    createMutation.mutate({
      productId,
      title: formData.title,
      description: formData.description,
      targetCount,
      deadline: formData.deadline,
    });
  };

  return (
    <div className="group-purchase-create">
      <h1>공동구매 열기</h1>
      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-group">
          <label htmlFor="productId">상품</label>
          <select
            id="productId"
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            required
          >
            <option value="">상품을 선택하세요</option>
            {products?.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.price.toLocaleString()}원
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="title">제목</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="공동구매 제목을 입력하세요"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">설명</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            placeholder="공동구매 상세 설명을 입력하세요"
          />
        </div>
        <div className="form-group">
          <label htmlFor="targetCount">목표 인원</label>
          <input
            type="number"
            id="targetCount"
            name="targetCount"
            value={formData.targetCount}
            onChange={handleChange}
            required
            min="1"
            placeholder="목표 참여자 수를 입력하세요"
          />
        </div>
        <div className="form-group">
          <label htmlFor="deadline">마감일시</label>
          <input
            type="datetime-local"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cancel-btn"
          >
            취소
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={createMutation.isLoading}
          >
            {createMutation.isLoading ? '생성 중...' : '공동구매 열기'}
          </button>
        </div>
      </form>
    </div>
  );
}

