// src/components/AdminPanel.jsx
import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    base_price: '',
    category_id: '',
    image: null
  });
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState('');

  // pobierz listę produktów
  const fetchProducts = () => {
    api.get('/api/products')
       .then(res => setProducts(res.data))
       .catch(console.error);
  };

  // pobierz kategorie
  const fetchCategories = () => {
    api.get('/api/categories')
       .then(res => setCategories(res.data))
       .catch(console.error);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // obsługa zmian w formularzu
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // obsługa pliku
  const handleFileChange = e => {
    const file = e.target.files[0];
    setForm(prev => ({ ...prev, image: file }));
    setPreview(file ? URL.createObjectURL(file) : '');
  };

  // dodaj produkt
  const handleAdd = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('base_price', form.base_price);
    formData.append('category_id', form.category_id);
    if (form.image) formData.append('image', form.image);

    try {
      await api.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      alert('Produkt dodany!');
      setForm({ name: '', description: '', base_price: '', category_id: '', image: null });
      setPreview('');
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Błąd podczas dodawania produktu');
    }
  };

  // edytuj produkt
  const handleEdit = product => {
    setEditingId(product.product_id);
    setForm({
      name: product.name,
      description: product.description,
      base_price: product.base_price,
      category_id: product.category_id,
      image: null
    });
    setPreview(`http://localhost:8081/api/products/${product.product_id}/image`);
  };

  // zapisz edycję
  const handleUpdate = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('base_price', form.base_price);
    formData.append('category_id', form.category_id);
    if (form.image) formData.append('image', form.image);

    try {
      await api.put(`/api/products/${editingId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      alert('Produkt zaktualizowany!');
      setEditingId(null);
      setForm({ name: '', description: '', base_price: '', category_id: '', image: null });
      setPreview('');
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Błąd podczas aktualizacji produktu');
    }
  };

  // usuń produkt
  const handleDelete = async id => {
    if (!confirm('Czy na pewno chcesz usunąć ten produkt?')) return;
    try {
      await api.delete(`/api/products/${id}`, { withCredentials: true });
      alert('Produkt usunięty!');
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Błąd podczas usuwania produktu');
    }
  };

  // anuluj edycję
  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: '', description: '', base_price: '', category_id: '', image: null });
    setPreview('');
  };

  return (
    <div className="admin-panel">
      <h2>Panel admina – zarządzanie produktami</h2>

      <form onSubmit={editingId ? handleUpdate : handleAdd}>
        <label>Nazwa:</label>
        <input type="text" name="name" value={form.name} onChange={handleChange} required />

        <label>Opis:</label>
        <textarea name="description" value={form.description} onChange={handleChange} required />

        <label>Cena bazowa:</label>
        <input type="number" step="0.01" name="base_price" value={form.base_price} onChange={handleChange} required />

        <label>Kategoria:</label>
        <select name="category_id" value={form.category_id} onChange={handleChange} required>
          <option value="">-- wybierz kategorię --</option>
          {categories.map(cat => (
            <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
          ))}
        </select>

        <label>Obrazek:</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        {preview && (
          <div className="admin-preview">
            <p>Podgląd:</p>
            <img src={preview} alt="podgląd" />
          </div>
        )}

        <button type="submit">{editingId ? 'Zaktualizuj produkt' : 'Dodaj produkt'}</button>
        {editingId && <button type="button" onClick={handleCancel}>Anuluj</button>}
      </form>

      <h3>Lista produktów</h3>
      <ul>
        {products.map(p => (
          <li key={p.product_id}>
            <strong>{p.name}</strong> - {p.base_price} zł - Kategoria: {p.category_name}
            <button onClick={() => handleEdit(p)}>Edytuj</button>
            <button onClick={() => handleDelete(p.product_id)}>Usuń</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
