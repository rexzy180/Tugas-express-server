require("dotenv").config();
const express = require("express");
const app = express();
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const authenticateToken = require("./middleware/auth");

app.use(express.json());

// rate limiter untuk proteksi brute-force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // maksimal 100 request per IP
});
app.use(limiter);

// contoh endpoint public
app.get("/", (req, res) => {
  res.json({ massage: "Server jalan"});
});

// contoh endpoint protected
app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Ini endpoint yang hanya bisa diakses pakai token", user: req.user });
});

// contoh endpoint POST dengan validasi (anti SQL Injection basic)
app.post("/login",
  body("username").isAlphanumeric(),
  body("password").isLength({ min: 5 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // dummy login → seharusnya cek DB dengan query parameterized (bukan concat string)
    const user = { id: 1, username: req.body.username };

    const jwt = require("jsonwebtoken");
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

    res.json({ token });
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});

