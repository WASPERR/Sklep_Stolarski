import Header from '../components/Header'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      
      <main className="home">
        <h1>Witaj w Sklepie Stolarskim</h1>
        <p>Meble z litego drewna na wymiar – stworzone z pasją.</p>
        <Link to="/products" className="btn">Zobacz produkty</Link>
      </main>
    </>
  )
}