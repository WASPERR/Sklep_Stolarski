import { Link } from 'react-router-dom';
import useCart from '../hooks/useCart'; // ścieżka do hooka useCart

export default function ProductCard({
  product_id,
  name,
  description,
  base_price,
  min_production_days,
}) {
  const { add, loading } = useCart();

  const handleAdd = (e) => {
    e.preventDefault(); // żeby nie otworzyć szczegółów produktu
    add(product_id);
  };

  return (
    <Link to={`/products/${product_id}`} className="card-link">
      <div className="card">
        <img
          src={`http://localhost:8081/api/products/${product_id}/image`}
          alt={name}
        />
        <h3>{name}</h3>
        <p>{description}</p>
        <div className="price">{Number(base_price).toFixed(2)} zł</div>
        <div className="lead-time">Czas realizacji: {min_production_days} dni</div>
        <button className="btn-small" onClick={handleAdd} disabled={loading}>
          {loading ? 'Dodawanie...' : 'Dodaj do koszyka'}
        </button>
      </div>
    </Link>
  );
}