import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api/axios';

export default function Header() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('>>> Header: start');
    api.get('/api/user', { withCredentials: true })
      .then(res => {
        console.log('>>> Header: dane użytkownika', res.data);
        setUser(res.data);
      })
      .catch(err => {
        console.error('>>> Header: błąd /api/user', err);
        alert('Sesja wygasła lub token jest nieprawidłowy. Zostałeś wylogowany.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await api.post('/api/logout', {}, { withCredentials: true });
    alert('Zostałeś pomyślnie wylogowany.');
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="logo">Sklep Stolarski</div>
      <nav>
        <NavLink to="/">Strona główna</NavLink>
        <NavLink to="/products">Produkty</NavLink>
        {loading ? (
          <span>Ładowanie...</span>
        ) : user ? (
          <>
            <span>Witaj, {user.first_name}!</span>
            <button onClick={handleLogout}>Wyloguj</button>
          </>
        ) : (
          <NavLink to="/login">Zaloguj się</NavLink>
        )}
      </nav>
    </header>
  );
}