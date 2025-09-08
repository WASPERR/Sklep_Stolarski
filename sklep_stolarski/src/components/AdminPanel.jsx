// src/pages/AdminPanel.jsx
import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  // pobierz listę produktów
  useEffect(() => {
    api.get('/api/products')
       .then(res => setProducts(res.data))
       .catch(console.error);
  }, []);

  // podgląd przed wysłaniem
  const onFileChange = e => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : '');
  };

  // wyślij obrazek
  const handleUpload = async () => {
    if (!selectedId || !file) return alert('Wybierz produkt i plik');
    const form = new FormData();
    form.append('image', file);

    try {
      await api.patch(`/api/products/${selectedId}/image`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Obrazek zapisany!');
      setFile(null);
      setPreview('');
    } catch (err) {
      console.error(err);
      alert('Błąd podczas wysyłania');
    }
  };

  return (
    <div className="admin-panel">
      <h2>Panel admina – upload obrazków</h2>

      <label>Wybierz produkt:</label>
      <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
        <option value="">-- wybierz --</option>
        {products.map(p => (
          <option key={p.product_id} value={p.product_id}>
            #{p.product_id} {p.name}
          </option>
        ))}
      </select>

      <label>Wybierz plik JPG/PNG:</label>
      <input type="file" accept="image/*" onChange={onFileChange} />

      {preview && (
        <div className="admin-preview">
          <p>Podgląd:</p>
          <img src={preview} alt="podgląd" />
        </div>
      )}

      <button
        className="admin-upload-btn"
        onClick={handleUpload}
        disabled={!selectedId || !file}
      >
        Upload
      </button>
    </div>
  );
}