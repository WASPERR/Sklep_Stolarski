import { useState } from 'react';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    console.log('>>> Login: wysyłam', { email, password });

    try {
      const { data } = await api.post('/api/login', { email, password }, { withCredentials: true });
      console.log('>>> Login: odpowiedź serwera', data);
      alert('Zalogowano pomyslnie');
      window.location.href = '/';
    } catch (err) {
      console.error('>>> Login: błąd', err);
      setError(err.response?.data?.error || 'Błąd logowania');
    }
  };

  return (
    <main className="login-page">
      <h2>Logowanie</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Adres e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Haslo" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Zaloguj sie</button>
      </form>
    </main>
  );
}