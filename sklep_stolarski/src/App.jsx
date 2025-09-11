import { Routes, Route } from 'react-router-dom';
import Home     from './pages/Home';
import Products from './pages/Products';
import Login    from './pages/Login';
import Register from './pages/Register';
import CartPage from './pages/Cart';
import ProductDetail from './components/ProductDetail';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';

export default function App() {
  return (
    <>
    <Header/>
      <Routes>
      <Route path="/"        element={<Home />}     />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/login"   element={<Login />}    />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/cart" element={<CartPage />} />
    </Routes>
    <Footer/>
    </>

  );
}
