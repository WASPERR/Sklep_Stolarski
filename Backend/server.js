const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());   // przydatne dla POST/PUT
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

// ===== POŁĄCZENIE =====
const db = mysql.createConnection({
  host    : 'localhost',
  user    : 'root',
  password: '',
  database: 'carpentry_shop'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected');
});

// ===== ROUTY =====

// 1) Test
app.get('/', (_req, res) => {
  res.json({ msg: 'API works' });
});

// 2) WSZYSTKIE produkty + sortowanie
app.get('/api/products', (req, res) => {
  const { sort = 'name', order = 'ASC' } = req.query; // ASC / DESC
  const allowed = ['name', 'base_price'];
  const col     = allowed.includes(sort) ? sort : 'name';
  const dir     = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const sql = `SELECT * FROM products ORDER BY ${col} ${dir}`;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});
// 3) WYSZUKIWANIE
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);

  const sql = `
    SELECT product_id, name, description, base_price, min_production_days, default_image_url
    FROM products
    WHERE name LIKE ? OR description LIKE ?
  `;
  db.query(sql, [`%${q}%`, `%${q}%`], (err, rows) => {
    if (err) {
      console.error('Search error:', err);
      return res.status(500).json([]);
    }
    console.log('Rows found:', rows.length);
    res.json(rows);
  });
});
// 4) SZCZEGÓŁY PRODUKTU
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM products WHERE product_id = ?';

  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error('Błąd podczas pobierania produktu:', err);
      return res.status(500).json({ error: 'Błąd serwera' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Produkt nie znaleziony' });
    }

    res.json(rows[0]);
  });
});
// Wysylanie obrazka
app.patch('/api/products/:id/image', upload.single('image'), (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ error: 'Brak pliku' });

  const { buffer, mimetype } = req.file;

  const sql = `
    INSERT INTO product_images (product_id, image_data, image_type)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      image_data = VALUES(image_data),
      image_type = VALUES(image_type)
  `;
  db.query(sql, [id, buffer, mimetype], (err, result) => {
    if (err) return res.status(500).json({ error: 'Błąd zapisu' });
    res.json({ message: 'Obrazek zapisany' });
  });
});
// Pobieranie obrazka
app.get('/api/products/:id/image', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT image_data, image_type
    FROM product_images
    WHERE product_id = ?
    LIMIT 1
  `;
  db.query(sql, [id], (err, rows) => {
    if (err || rows.length === 0 || !rows[0].image_data) {
      return res.redirect('https://placehold.co/500x400');
    }

    const { image_data, image_type } = rows[0];
    res.set('Content-Type', image_type);
    res.send(image_data);
  });
});
// ===== LOGOWANIE – FULL DEBUG =====
app.post('/api/login', async (req, res) => {
  console.log('>>> ENTER /api/login');
  console.log('>>> req.body:', req.body);

  const { email, password } = req.body;
  if (!email || !password) {
    console.log('>>> brak danych – 400');
    return res.status(400).json({ error: 'Brak e-maila lub hasła' });
  }

  // realny SQL – dokładnie Twoje kolumny
  const sql = `SELECT user_id, email, password_hash, first_name, last_name, role
               FROM users
               WHERE email = ?
               LIMIT 1`;

  db.query(sql, [email], async (err, rows) => {
    if (err) {
      console.error('>>> błąd SQL:', err);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
    console.log('>>> znaleziono wierszy:', rows.length);
    if (rows.length === 0) {
      console.log('>>> brak użytkownika – 401');
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
    }

    const user = rows[0];
    console.log('>>> hash z bazy :', user.password_hash);
    console.log('>>> plain hasło :', password);

    // porównanie – bcryptjs akceptuje $2y$
    const match = await bcrypt.compare(password, user.password_hash);
    console.log('>>> bcrypt wynik:', match);
    if (!match) {
      console.log('>>> hasło nie pasuje – 401');
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
    }

    // JWT – 24h
    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      'ZMIEŃ_TO_NA_DŁUGI_CIĄG_ZNAKÓW', // ← w produkcji process.env.JWT_SECRET
      { expiresIn: '24h' }
    );

    console.log('>>> login OK, wysyłam token');
    res.json({
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
  });
});
(async () => {
  const hash = await bcrypt.hash('NoweHaslo123', 10);
  console.log('>>> Hash dla NoweHaslo123:', hash);
})();
(async () => {
  const hash = await bcrypt.hash('NoweHaslo123', 10);
  console.log('>>> Hash dla NoweHaslo123:', hash);
})();
(async () => {
  const hash = await bcrypt.hash('NoweHaslo123', 10);
  console.log('>>> Hash dla NoweHaslo123:', hash);
})();
// ===== START =====
const PORT = 8081;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});