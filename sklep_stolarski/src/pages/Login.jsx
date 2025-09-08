// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // automatycznie ukryj błąd po 4 s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 4000);
    return () => clearTimeout(t);
  }, [error]);

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('firstName', data.user.first_name);
      navigate('/products');           // ← React-Router, brak przeładowania
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Nieprawidłowy e-mail lub hasło'
      );
    } finally {
      setLoading(false);
    }
    console.log('Wysyłam POST na /api/login', { email, password });
  };

  return (
    <main className="login-page">
      <h2>Logowanie</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Adres e-mail"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Hasło"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Logowanie…' : 'Zaloguj się'}
        </button>
      </form>

      {/* drobny dodatek – link do rejestracji (opcjonalnie) */}
      <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
        <a href="/register" className="link">
          Nie masz konta?{' '} Zarejestruj się
        </a>
      </p>
    </main>
    
  );
} 