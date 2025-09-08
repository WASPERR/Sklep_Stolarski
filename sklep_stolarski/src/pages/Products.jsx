import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import Sidebar from '../components/Sidebar';

export default function Products() {
  const [items, setItems] = useState([]);
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(15);

  useEffect(() => {
    const url = searching
      ? `/api/search?q=${encodeURIComponent(query)}`
      : `/api/products?sort=${sort}&order=${order}`;

    axios.get(url)
      .then(res => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setItems([]));
  }, [sort, order, searching, query]);

  const handleSearch = () => setSearching(query.trim() !== '');

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = items.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(items.length / productsPerPage); i++) {
      pageNumbers.push(i);
    }
    return pageNumbers.map(number => (
      <li key={number} className={currentPage === number ? 'active' : ''}>
        <a onClick={() => paginate(number)}>{number}</a>
      </li>
    ));
  };

  return (
    <>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Szukaj..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>Szukaj</button>
      </div>

      <div className="products-layout">
        <Sidebar
          sort={sort}
          setSort={setSort}
          order={order}
          setOrder={setOrder}
        />

        <main className="products-main">
          {currentProducts.length ? (
            <div className="grid">
              {currentProducts.map(p => (
                <ProductCard key={Number(p.product_id)} {...p} />
              ))}
            </div>
          ) : (
            <p>Brak produktów.</p>
          )}
          <div className="pagination">
            <ul>
              {renderPageNumbers()}
            </ul>
          </div>
        </main>
      </div>

    </>
  );
}