const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
app.use(express.json());

const port = Number(process.env.PORT) || 3000;
let db;

async function connectDB() {
  const config = {
    host: process.env.DB_HOST || "db",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "user_db",
    port: Number(process.env.DB_PORT) || 3306,
  };

  // Loop retry connection jika MySQL belum siap menerima koneksi
  for (let i = 0; i < 10; i++) {
    try {
      db = await mysql.createConnection(config);
      console.log("✅ Berhasil terhubung ke database MySQL!");

      // Membuat tabel users otomatis jika belum ada
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL
        )
      `);
      return;
    } catch (err) {
      console.error(
        `❌ Koneksi database gagal. ${err.code || "UNKNOWN"}: ${err.message}`,
      );
      console.error(err);
      console.log(`⏳ Mencoba kembali dalam 5 detik... (${i + 1}/10)`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  process.exit(1);
}

// [GET] Mengambil semua user
app.get("/users", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// [POST] Menambah user baru
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({ message: "Name and email are required" });

  try {
    const [result] = await db.query(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [name, email],
    );
    res.status(201).json({ id: result.insertId, name, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// [PUT] Memperbarui data user berdasarkan ID
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({ message: "Name and email are required" });

  try {
    const [result] = await db.query(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, id],
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });
    res.json({ message: "User berhasil diperbarui", id, name, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// [DELETE] Menghapus user berdasarkan ID
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });
    res.json({ message: "User berhasil dihapus", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Jalankan koneksi DB baru hidupkan server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server berjalan pada port ${port}`);
  });
});
