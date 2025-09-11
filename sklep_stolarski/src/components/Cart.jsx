import useCart from '../hooks/useCart';

export default function Cart() {
  const { items, loading, error, remove, clear, updateQuantity } = useCart();

  if (loading) return <p>Ładowanie koszyka...</p>;
  if (error)   return <p className="error">{error}</p>;

  const changeQty = (id, qty) => {
    const val = parseInt(qty, 10);
    if (!Number.isNaN(val)) updateQuantity(id, val);
  };

  return (
    <div className="cart-page">
      {items.length === 0 ? (
        <p>Twój koszyk jest pusty.</p>
      ) : (
        <>
          <button onClick={clear}>Wyczyść koszyk</button>
          <ul>
            {items.map(item => (
              <li key={item.product_id} className="cart-item">
                <img
                  src={`http://localhost:8081/api/products/${item.product_id}/image`}
                  alt={item.name}
                  className="cart-thumb"
                />

                <div className="cart-details">
                  <strong>{item.name}</strong>
                  <br />
                  {(Number(item.base_price) * item.quantity).toFixed(2)} zł
                </div>

                {/* ----- kontrolka ilości ----- */}
                <div className="qty-controls">
                  <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>-</button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => changeQty(item.product_id, e.target.value)}
                    className="qty-input"
                  />
                  <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                </div>
                <button
                className="btn-remove"
                onClick={() => remove(item.product_id)}
                >
                Usuń
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}