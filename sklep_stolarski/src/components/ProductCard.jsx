// src/components/ProductCard.js
import { Link } from 'react-router-dom';

export default function ProductCard({ product_id, name, description, base_price, min_production_days, default_image_url }) {
  return (
    <Link to={`/products/${product_id}`} className="card-link">
      <div className="card">
        <img
          src={`http://localhost:8081/api/products/${product_id}/image`}
          alt="produkt"
        />
        <h3>{name}</h3>
        <p>{description}</p>
        <div className="price">{Number(base_price).toFixed(2)} zł</div>
        <div className="lead-time">Czas realizacji: {min_production_days} dni</div>
        <button className="btn-small">Dodaj do koszyka</button>
      </div>
    </Link>
  );
}