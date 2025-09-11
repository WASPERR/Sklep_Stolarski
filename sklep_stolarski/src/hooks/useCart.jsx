import { useEffect, useState } from 'react';
import api from '../api/axios';

const normalizeId = id => Number(id);

const mergeItems = arr =>
  arr.reduce((acc, cur) => {
    const id = normalizeId(cur.product_id);
    const found = acc.find(it => it.product_id === id);
    if (found) found.quantity += cur.quantity;
    else acc.push({ ...cur, product_id: id });
    return acc;
  }, []);

export default function useCart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  /* ----- pobranie / odświeżenie ----- */
  const refreshCart = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await api.get('/api/cart', { withCredentials: true });
        setIsLoggedIn(true);
        setItems(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          // Token invalid, switch to guest
          setIsLoggedIn(false);
          localStorage.removeItem('token');
          // Use localStorage
          const raw = JSON.parse(localStorage.getItem('cart')) || [];
          const merged = mergeItems(raw);
          const fullItems = await Promise.all(
            merged.map(async item => {
              try {
                const { data } = await api.get(`/api/products/${item.product_id}`);
                return {
                  ...item,
                  name: data.name,
                  base_price: Number(data.base_price),
                  default_image_url: `http://localhost:8081/api/products/${item.product_id}/image`,
                };
              } catch {
                return {
                  ...item,
                  name: 'Nieznany produkt',
                  base_price: 0,
                  default_image_url: 'https://placehold.co/300x200',
                };
              }
            })
          );
          setItems(fullItems);
        } else {
          setError(err.response?.data?.error || 'Błąd pobierania koszyka');
        }
      } finally {
        setLoading(false);
      }
    } else {
      setIsLoggedIn(false);
      const raw = JSON.parse(localStorage.getItem('cart')) || [];
      const merged = mergeItems(raw);
      const fullItems = await Promise.all(
        merged.map(async item => {
          try {
            const { data } = await api.get(`/api/products/${item.product_id}`);
            return {
              ...item,
              name: data.name,
              base_price: Number(data.base_price),
              default_image_url: `http://localhost:8081/api/products/${item.product_id}/image`,
            };
          } catch {
            return {
              ...item,
              name: 'Nieznany produkt',
              base_price: 0,
              default_image_url: 'https://placehold.co/300x200',
            };
          }
        })
      );
      setItems(fullItems);
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  /* ----- add ----- */
  const add = async (productId, qty = 1) => {
    const id = normalizeId(productId);
    if (isLoggedIn) {
      try {
        const { data: cartItems } = await api.get('/api/cart', { withCredentials: true });
        const existingItem = cartItems.find(item => item.product_id === id);
        if (existingItem) {
          await api.patch(`/api/cart/${id}`, { quantity: existingItem.quantity + qty }, { withCredentials: true });
        } else {
          await api.post('/api/cart', { product_id: id, quantity: qty }, { withCredentials: true });
        }
        await refreshCart();
      } catch (err) {
        setError(err.response?.data?.error || 'Błąd dodawania');
      }
    } else {
      const raw = JSON.parse(localStorage.getItem('cart')) || [];
      const current = raw.find(it => normalizeId(it.product_id) === id);
      if (current) current.quantity += qty;
      else raw.push({ product_id: id, quantity: qty });
      localStorage.setItem('cart', JSON.stringify(raw));
      await refreshCart();
    }
  };

  /* ----- remove ----- */
  const remove = async productId => {
    const id = normalizeId(productId);
    if (isLoggedIn) {
      try {
        await api.delete(`/api/cart/${id}`, { withCredentials: true });
        await refreshCart();
      } catch (err) {
        setError(err.response?.data?.error || 'Błąd usuwania');
      }
    } else {
      const raw = JSON.parse(localStorage.getItem('cart')) || [];
      const filtered = raw.filter(it => normalizeId(it.product_id) !== id);
      localStorage.setItem('cart', JSON.stringify(filtered));
      await refreshCart();
    }
  };

  /* ----- clear ----- */
  const clear = async () => {
    if (isLoggedIn) {
      try {
        await api.delete('/api/cart', { withCredentials: true });
        await refreshCart();
      } catch (err) {
        setError(err.response?.data?.error || 'Błąd wyczyszczania koszyka');
      }
    } else {
      localStorage.removeItem('cart');
      await refreshCart();
    }
  };

  /* ====== NOWA METODA: zmiana ilości ====== */
  const updateQuantity = async (productId, newQty) => {
    const id = normalizeId(productId);
    if (newQty <= 0) {
      await remove(id);
      return;
    }

    if (!isLoggedIn) {
      const raw = JSON.parse(localStorage.getItem('cart')) || [];
      const current = raw.find(it => normalizeId(it.product_id) === id);
      if (current) {
        current.quantity = newQty;
        localStorage.setItem('cart', JSON.stringify(raw));
      }
      await refreshCart();
      return;
    }

    try {
      await api.patch(`/api/cart/${id}`, { quantity: newQty }, { withCredentials: true });
      await refreshCart();
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd aktualizacji');
    }
  };

  return { items, loading, error, add, remove, clear, updateQuantity };
}
