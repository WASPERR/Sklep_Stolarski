import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="header">
      <div className="logo">Sklep Stolarski</div>
      <nav>
        <NavLink to="/">Strona główna</NavLink>
        <NavLink to="/products">Produkty</NavLink>
        <NavLink to="/login">Zaloguj się</NavLink>
      </nav>
    </header>
  )
}