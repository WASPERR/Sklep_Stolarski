import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useCart from '../hooks/useCart'; // ścieżka do hooka useCart
import api from '../api/axios';

export default function ProductDetail() {
  const { id } = useParams(); // string lub number
  const { add, loading: addLoading } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/api/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError(
          err.response?.data?.error || 'Nie udało się załadować produktu.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div>Ładowanie...</div>;
  if (error)   return <div>{error}</div>;
  if (!product) return <div>Produkt nie znaleziony.</div>;

  return (
    <div className="product-detail">
      <div className="product-detail-content">
        <div className="product-detail-image">
          <img
            src={`http://localhost:8081/api/products/${id}/image`}
            alt={product.name}
          />
        </div>

        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="price">Cena: {Number(product.base_price).toFixed(2)} zł</div>
          <div className="lead-time">Czas realizacji: {product.min_production_days} dni</div>

          <button
            className="btn"
            onClick={() => add(id)}
            disabled={addLoading}
          >
            {addLoading ? 'Dodawanie...' : 'Dodaj do koszyka'}
          </button>
        </div>
      </div>
    </div>
  );
}