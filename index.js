require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// rate limiter untuk proteksi brute-force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // maksimal 100 request per IP
});
app.use(limiter);

// root agar browser tidak lihat "Cannot GET /"
app.get("/", (req, res) => {
  res.json({ massage: "Server jalan"});
});

// login (contoh)
app.post('/login',
  body('username').notEmpty(),
  body('password').notEmpty(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    // contoh user statis
    if (username === 'admin' && password === '12345') {
      const token = jwt.sign({ username }, process.env.JWT_SECRET || 'rahasia123', { expiresIn: '1h' });
      return res.json({ message: 'Login berhasil', token });
    }
    res.status(401).json({ message: 'Username atau password salah' });
  }
);

// protected route
app.get('/profile', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, process.env.JWT_SECRET || 'rahasia123', (err, user) => {
    if (err) return res.status(403).json({ message: 'Token invalid' });
    res.json({ message: 'Ini data profile rahasia', user });
  });
});

app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));

