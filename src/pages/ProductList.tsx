import { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { productAPI } from '@/utils/api';
import type { Product } from '@/types';
import './ProductList.css';

export default function ProductList() {
  const [lastId, setLastId] = useState<number | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const { isLoading } = useQuery(
    ['products', lastId],
    () => productAPI.getList(lastId, 10),
    {
      enabled: hasMore && !isFetchingMore,
      onSuccess: (data) => {
        if (data.length === 0) {
          setHasMore(false);
        } else {
          if (lastId === undefined) {
            // 첫 로드
            setProducts(data);
          } else {
            // 추가 로드
            setProducts((prev) => [...prev, ...data]);
          }
          const newLastId = data[data.length - 1].id;
          setLastId(newLastId);
        }
        setIsFetchingMore(false);
      },
    }
  );

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore && !isFetchingMore && products.length > 0) {
      setIsFetchingMore(true);
      const currentLastId = products[products.length - 1].id;
      setLastId(currentLastId);
    }
  }, [isLoading, hasMore, isFetchingMore, products]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
    ) {
      loadMore();
    }
  }, [loadMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (isLoading && products.length === 0) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="product-list">
      <h1>상품 목록</h1>
      <div className="products-grid">
        {products.map((product) => (
          <Link key={product.id} to={`/products/${product.id}`} className="product-card">
            <img src={product.imageUrl} alt={product.name} className="product-image" />
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <p className="product-price">{product.price.toLocaleString()}원</p>
            </div>
          </Link>
        ))}
      </div>
      {(isLoading || isFetchingMore) && products.length > 0 && (
        <div className="loading-more">더 불러오는 중...</div>
      )}
      {!hasMore && products.length > 0 && (
        <div className="no-more">더 이상 상품이 없습니다.</div>
      )}
    </div>
  );
}

