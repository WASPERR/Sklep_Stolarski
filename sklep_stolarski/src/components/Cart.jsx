import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/api/cart', { withCredentials: true });
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd pobierania koszyka');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <p>Ładowanie koszyka...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      {items.length === 0 ? (
        <p>Twój koszyk jest pusty.</p>
      ) : (
        <ul>
          {items.map(item => (
            <li key={item.product_id}>
              {item.name} - {item.quantity} szt. - {item.base_price * item.quantity} zł
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}