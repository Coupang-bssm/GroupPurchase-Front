import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { productAPI } from '@/utils/api';
import { getErrorMessage } from '@/utils/errorHandler';
import './ProductCreate.css';

export default function ProductCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
  });
  const [error, setError] = useState('');

  const createMutation = useMutation(
    (data: { name: string; description: string; price: number; imageUrl: string }) =>
      productAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        alert('상품이 등록되었습니다.');
        navigate('/products');
      },
      onError: (err: unknown) => {
        setError(getErrorMessage(err, '상품 등록에 실패했습니다.'));
      },
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

    const price = parseInt(formData.price, 10);
    if (isNaN(price) || price <= 0) {
      setError('가격은 0보다 큰 숫자여야 합니다.');
      return;
    }

    createMutation.mutate({
      name: formData.name,
      description: formData.description,
      price,
      imageUrl: formData.imageUrl,
    });
  };

  return (
    <div className="product-create">
      <h1>상품 등록</h1>
      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-group">
          <label htmlFor="name">상품명</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="상품명을 입력하세요"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">상품 설명</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            placeholder="상품 설명을 입력하세요"
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">가격</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="1"
            placeholder="가격을 입력하세요"
          />
        </div>
        <div className="form-group">
          <label htmlFor="imageUrl">이미지 URL</label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            required
            placeholder="https://example.com/image.jpg"
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
            {createMutation.isLoading ? '등록 중...' : '상품 등록'}
          </button>
        </div>
      </form>
    </div>
  );
}

