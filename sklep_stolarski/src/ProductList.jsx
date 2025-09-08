import React, { useEffect, useState } from 'react';

function ProductsList() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8081/api/products')
            .then(response => response.json())
            .then(data => setProducts(data))
            .catch(error => console.error('Error fetching products:', error));
    }, []);

    return (
        <div>
            <h1>Products List</h1>
            <ul>
                {products.map(product => (
                    <li key={product.product_id}>
                        <strong>{product.name}</strong> - {product.description}
                        <p>Base Price: ${product.base_price}</p>
                        <p>Category ID: {product.category_id}</p>
                        <p>Min Production Days: {product.min_production_days}</p>
                        <p>Created At: {product.created_at}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ProductsList;