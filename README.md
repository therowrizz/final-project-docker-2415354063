# Laporan Hasil Praktikum: Final Project Aplikasi Berbasis Container

## Identitas Mahasiswa

- **Nama:** I Gusti Made Rizky Dwiguna
- **NIM:** 2415354063
- **Kelas/Rombel:** TRPL 4 c
- **Tanggal Praktikum:** 20 Mei 2026

---

# Project App - Panduan Pengujian

Aplikasi Node.js + Express + MySQL dengan Docker Compose untuk CRUD User.

---

## Teknologi & Tools yang Digunakan

- **Sistem Operasi:** Windows / Linux / MacOS
- **Containerization:** Docker & Docker Compose
- **Bahasa Pemrograman:** JavaScript (Node.js)
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **Tools Lain:** VS Code, Git, Postman, Docker Hub

---

## 1. Pengujian Docker Compose, Volume, Network, Container

### 1.1 Membangun dan Menjalankan Stack

```bash
cd project-app
docker compose up --build
```

**Output yang diharapkan:**

- ✅ Image `project-app-web:latest` berhasil dibangun
- ✅ Container `project-app-web-1` berjalan
- ✅ Container `project-app-db-1` berjalan
- ✅ Message: `🚀 Server berjalan pada port 3000`
- ✅ Message: `✅ Berhasil terhubung ke database MySQL!`

### 1.2 Memverifikasi Container Berjalan

```bash
docker compose ps
```

**Output yang diharapkan:**

```bash
NAME                IMAGE                         STATUS
project-app-db-1   mysql:8.0                     Up (healthy)
project-app-web-1  project-app-web:latest        Up
```

### 1.3 Memverifikasi Network

```bash
docker network ls
```

**Verifikasi:**

- Cari network bernama `project-app_app-network`

```bash
docker network inspect project-app_app-network
```

**Output yang diharapkan:**

- Container `project-app-web-1` terhubung ke network
- Container `project-app-db-1` terhubung ke network
- Bridge driver digunakan

### 1.4 Memverifikasi Volume

```bash
docker volume ls
```

**Verifikasi:**

- Cari volume bernama `project-app_db-data-fresh`

```bash
docker volume inspect project-app_db-data-fresh
```

**Output yang diharapkan:**

- Mountpoint menunjuk ke lokasi penyimpanan data MySQL lokal

### 1.5 Melihat Log Container

#### Web Container

```bash
docker compose logs web-1
```

**Verifikasi:**

- Tidak ada error koneksi database
- Message: `✅ Berhasil terhubung ke database MySQL!`

#### Database Container

```bash
docker compose logs db-1
```

**Verifikasi:**

- Message: `ready for connections. Version: 8.0.46`

### 1.6 Testing Koneksi Database dari Host

```bash
mysql -h 127.0.0.1 -u app_user -papp_pass user_db
```

**Verifikasi:**

- Login berhasil ke MySQL
- Query: `SELECT * FROM users;`

---

## 2. Pengujian Endpoint - Request dan Response

### 2.1 Setup Postman / Browser

- URL Base: `http://localhost:3000`
- Headers: `Content-Type: application/json`

### 2.2 GET `/users` - Mengambil Semua User

**Method:** GET  
**URL:** `http://localhost:3000/users`

**Expected Response (Status 200):**

```json
[]
```

### 2.3 POST `/users` - Menambah User Baru

**Method:** POST  
**URL:** `http://localhost:3000/users`  
**Headers:** `Content-Type: application/json`

**Request Body:**

```json
{
  "name": "rizky dwiguna",
  "email": "rizkydwiguna@gmail.com"
}
```

**Expected Response (Status 201):**

```json
{
  "id": 1,
  "name": "rizky dwiguna",
  "email": "rizkydwiguna@gmail.com"
}
```

### 2.4 GET `/users` - Mengambil Semua User (Verifikasi)

**Method:** GET  
**URL:** `http://localhost:3000/users`

**Expected Response (Status 200):**

```json
[
  {
    "id": 1,
    "name": "rizky dwiguna",
    "email": "rizkydwiguna@gmail.com"
  }
]
```

### 2.5 PUT `/users/:id` - Memperbarui User

**Method:** PUT  
**URL:** `http://localhost:3000/users/1`

**Request Body:**

```json
{
  "name": "rizky dwiguna bali",
  "email": "rizkydwiguna@gmail.com"
}
```

**Expected Response (Status 200):**

```json
{
  "message": "User berhasil diperbarui",
  "id": 1,
  "name": "rizky dwiguna bali",
  "email": "rizkydwiguna@gmail.com"
}
```

### 2.6 DELETE `/users/:id` - Menghapus User

**Method:** DELETE  
**URL:** `http://localhost:3000/users/1`

**Expected Response (Status 200):**

```json
{
  "message": "User berhasil dihapus",
  "id": 1
}
```

---

## 3. Pengujian Upload ke Docker Hub

### 3.1 Login ke Docker Hub

```bash
docker login
```

### 3.2 Tag Image

```bash
docker tag project-app-web:latest YOUR_DOCKERHUB_USERNAME/project-app:latest
docker tag project-app-web:latest YOUR_DOCKERHUB_USERNAME/project-app:v1.0
```

### 3.3 Push ke Docker Hub

```bash
docker push YOUR_DOCKERHUB_USERNAME/project-app:latest
docker push YOUR_DOCKERHUB_USERNAME/project-app:v1.0
```

---

## 4. Pengujian Tambahan

### 4.1 Performance - Bulk Insert

```bash
for i in {1..100}; do
  curl -X POST http://localhost:3000/users \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"User $i\",\"email\":\"user$i@example.com\"}"
done
```

### 4.2 SQL Injection Prevention

```json
{
  "name": "'; DROP TABLE users; --",
  "email": "test@example.com"
}
```

### 4.3 Error Handling - Invalid JSON

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d "invalid json{"
```

---

## Checklist Pengujian

- [ ] Docker Compose berjalan tanpa error
- [ ] Network connectivity antar container
- [ ] Volume persist data dengan benar
- [ ] GET `/users` mengembalikan data
- [ ] POST `/users` menambah user baru
- [ ] PUT `/users/:id` update user
- [ ] DELETE `/users/:id` hapus user
- [ ] Error handling bekerja
- [ ] Data persist setelah restart
- [ ] SQL Injection prevention

---

## Troubleshooting

### Container Exit Code 1

```bash
docker compose logs web-1
```

### Database Permission Denied

```bash
docker volume rm project-app_db-data-fresh
```

### Port 3000 Already in Use

```bash
docker compose down
lsof -i :3000
kill -9 <PID>
docker compose up
```

---

## Referensi

- https://expressjs.com/
- https://hub.docker.com/_/mysql
- https://docs.docker.com/compose/
- https://learning.postman.com/

---

## Kesimpulan

Project App adalah aplikasi CRUD sederhana menggunakan Docker Compose, Express.js, dan MySQL. Aplikasi sudah mendukung multi-container setup, volume persistence, serta pengujian endpoint CRUD menggunakan Postman maupun curl.
