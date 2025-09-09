const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
// ===== LOGOWANIE – ustawiamy ciasteczko =====
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Brak danych' });

  const sql = `SELECT user_id, email, password_hash, first_name, last_name, role
               FROM users WHERE email = ? LIMIT 1`;
  db.query(sql, [email], async (err, rows) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera' });
    if (rows.length === 0) return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });

    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      'ZMIEŃ_TO_NA_DŁUGI_CIĄG_ZNAKÓW',
      { expiresIn: '24h' }
    );

    // Ustawiamy ciasteczko HTTP-only
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    // Zwracamy tylko dane użytkownika (bez tokenu)
    res.json({
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
// ===== REJESTRACJA =====
app.post('/api/register', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Wszystkie pola są wymagane' });
  }

  const hash = await bcrypt.hash(password, 10);

  const sql = `
    INSERT INTO users (email, password_hash, first_name, last_name, role)
    VALUES (?, ?, ?, ?, 'customer')
  `;

  db.query(sql, [email, hash, first_name, last_name], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email już zajęty' });
      }
      return res.status(500).json({ error: 'Błąd serwera' });
    }
    res.status(201).json({ message: 'Konto utworzone' });
  });
});
// ===== Pobranie danych użytkownika – z ciasteczka =====
app.get('/api/user', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Brak autoryzacji' });

  try {
    const decoded = jwt.verify(token, 'ZMIEŃ_TO_NA_DŁUGI_CIĄG_ZNAKÓW');
    const sql = `SELECT user_id, email, first_name, last_name, role
                 FROM users WHERE user_id = ? LIMIT 1`;
    db.query(sql, [decoded.id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Błąd serwera' });
      if (rows.length === 0) return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
      res.json(rows[0]);
    });
  } catch (err) {
    return res.status(401).json({ error: 'Nieprawidłowy token' });
  }
});
// ===== WYLOGOWANIE – czyścimy ciasteczko =====
app.post('/api/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Wylogowano' });
});
// ===== KOSZYK =====

// pobranie zawartości koszyka
app.get('/api/cart', (req, res) => {
  console.log('>>> /api/cart: ciasteczka', req.cookies);
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ cart: [] });

  try {
    const decoded = jwt.verify(token, 'ZMIEŃ_TO_NA_DŁUGI_CIĄG_ZNAKÓW');
    const sql = `
      SELECT c.product_id, p.name, p.base_price, c.quantity
      FROM cart c
      JOIN products p ON c.product_id = p.product_id
      WHERE c.user_id = ?
    `;
    db.query(sql, [decoded.id], (err, rows) => {
      if (err) {
        console.error('>>> /api/cart: błąd SQL', err);
        return res.status(500).json({ error: 'Błąd serwera' });
      }
      console.log('>>> /api/cart: wiersze', rows);
      res.json(rows);
    });
  } catch (err) {
    console.error('>>> /api/cart: błąd weryfikacji', err);
    res.status(401).json({ cart: [] });
  }
});

// dodanie / aktualizacja pozycji
app.post('/api/cart', (req, res) => {
  console.log('>>> /api/cart: body', req.body);
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Brak autoryzacji' });

  try {
    const decoded = jwt.verify(token, 'ZMIEŃ_TO_NA_DŁUGI_CIĄG_ZNAKÓW');
    const { product_id, quantity } = req.body;
    if (!product_id || quantity < 1) return res.status(400).json({ error: 'Złe dane' });

    const sql = `
      INSERT INTO cart (user_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)
    `;
    db.query(sql, [decoded.id, product_id, quantity], (err) => {
      if (err) {
        console.error('>>> /api/cart: błąd SQL', err);
        return res.status(500).json({ error: 'Błąd serwera' });
      }
      console.log('>>> /api/cart: dodano');
      res.json({ message: 'Dodano do koszyka' });
    });
  } catch (err) {
    console.error('>>> /api/cart: błąd weryfikacji', err);
    res.status(401).json({ error: 'Nieprawidłowy token' });
  }
});

// ===== START =====
const PORT = 8081;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});