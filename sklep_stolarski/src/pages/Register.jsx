import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    console.log('>>> Register: wysyłam', { email, password, firstName, lastName });

    try {
      const { data } = await api.post('/api/register', { email, password, first_name: firstName, last_name: lastName });
      console.log('>>> Register: odpowiedź serwera', data);
      alert('Konto utworzone pomyślnie! Zaloguj się.');
      window.location.href = '/login';
    } catch (err) {
      console.error('>>> Register: błąd', err);
      setError(err.response?.data?.error || 'Błąd rejestracji');
    }
  };

  return (
    <main className="register-page">
      <h2>Rejestracja</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Imię" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <input type="text" placeholder="Nazwisko" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        <input type="email" placeholder="Adres e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Hasło" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Zarejestruj się</button>
      </form>
      <p>Masz już konto? <Link to="/login">Zaloguj się</Link></p>
    </main>
  );
}
