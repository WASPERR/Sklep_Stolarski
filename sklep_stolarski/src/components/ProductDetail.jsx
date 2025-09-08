// src/pages/ProductDetail.js
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams(); // Pobranie ID produktu z parametrów URL

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Błąd podczas pobierania produktu:', error);
        if (error.response) {
          setError(error.response.data.error || 'Nie udało się załadować produktu. Spróbuj ponownie później.');
        } else if (error.request) {
          setError('Brak odpowiedzi od serwera. Spróbuj ponownie później.');
        } else {
          setError('Błąd konfiguracji żądania. Spróbuj ponownie później.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!product) {
    return <div>Produkt nie znaleziony.</div>;
  }

  return (
    <div className="product-detail">
      <div className="product-detail-content">
        <div className="product-detail-image">
        <img
          src={`http://localhost:8081/api/products/${id}/image`}
          alt="produkt"
        />
        </div>
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="price">Cena: {Number(product.base_price).toFixed(2)} zł</div>
          <div className="lead-time">Czas realizacji: {product.min_production_days} dni</div>
          <button className="btn">Dodaj do koszyka</button>
        </div>
      </div>
    </div>
  );
}