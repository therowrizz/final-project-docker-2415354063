# Project App - Panduan Pengujian

Aplikasi Node.js + Express + MySQL dengan Docker Compose untuk CRUD User.

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

```
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

**Test Case - Validasi Required Fields:**

```json
{
  "name": "Jane"
}
```

**Expected Response (Status 400):**

```json
{
  "message": "Name and email are required"
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
**Headers:** `Content-Type: application/json`

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
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Test Case - User Tidak Ditemukan:**

```
URL: http://localhost:3000/users/999
```

**Expected Response (Status 404):**

```json
{
  "message": "User tidak ditemukan"
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

**Verifikasi dengan GET `/users`:**

```
Expected: []
```

### 2.7 Testing via Browser (GET Only)

```
https://localhost:3000/users
```

**Expected Result:**

- Menampilkan JSON array users

---

## 3. Pengujian Upload ke Docker Hub

### 3.1 Login ke Docker Hub

```bash
docker login
```

**Masukkan:**

- Username Docker Hub
- Password

### 3.2 Tag Image

```bash
docker tag project-app-web:latest YOUR_DOCKERHUB_USERNAME/project-app:latest
docker tag project-app-web:latest YOUR_DOCKERHUB_USERNAME/project-app:v1.0
```

**Verifikasi:**

```bash
docker images | grep YOUR_DOCKERHUB_USERNAME
```

### 3.3 Push ke Docker Hub

```bash
docker push YOUR_DOCKERHUB_USERNAME/project-app:latest
docker push YOUR_DOCKERHUB_USERNAME/project-app:v1.0
```

**Expected Output:**

- ✅ Pushed sha256:xxxxx
- ✅ latest: digest: sha256:xxxxx size: xxxx

### 3.4 Verifikasi di Docker Hub

- Kunjungi: `https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/project-app`
- Verifikasi tags `latest` dan `v1.0` tersedia

### 3.5 Pull Image dari Docker Hub (Clean Test)

```bash
docker rmi YOUR_DOCKERHUB_USERNAME/project-app:latest
docker pull YOUR_DOCKERHUB_USERNAME/project-app:latest
docker run -d -p 3001:3000 \
  -e DB_HOST=docker.for.mac.localhost \
  -e DB_USER=app_user \
  -e DB_PASSWORD=app_pass \
  -e DB_NAME=user_db \
  -e DB_PORT=3306 \
  YOUR_DOCKERHUB_USERNAME/project-app:latest
```

**Verifikasi:**

- Container berjalan
- API accessible di `http://localhost:3001/users`

---

## 4. Pengujian Lainnya yang Diperlukan

### 4.1 Health Check - Koneksi Database

**Test:** Matikan container database, lihat retry logic

```bash
docker compose down db
```

**Expected Behavior:**

- Web container mencoba koneksi ulang 10 kali
- Setiap percobaan interval 5 detik
- Jika gagal semua: exit dengan code 1

### 4.2 Performance - Bulk Insert

```bash
# Script untuk insert 100 users
for i in {1..100}; do
  curl -X POST http://localhost:3000/users \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"User $i\",\"email\":\"user$i@example.com\"}"
done
```

**Verifikasi:**

- Semua 100 user berhasil insert
- Response time masuk akal

### 4.3 Data Persistence - Volume Test

```bash
# 1. Tambah beberapa user
# 2. Stop container
docker compose down

# 3. Jalankan kembali
docker compose up -d

# 4. GET /users untuk verifikasi data masih ada
curl http://localhost:3000/users
```

**Expected Result:**

- Data tetap ada setelah container restart

### 4.4 Security - SQL Injection Prevention

**Test Payload:**

```json
{
  "name": "'; DROP TABLE users; --",
  "email": "test@example.com"
}
```

**Expected Behavior:**

- Query parameterized (menggunakan ?)
- Data insert dengan aman tanpa error

**Verifikasi:**

```bash
curl http://localhost:3000/users
```

**Expected:**

- Table `users` masih ada
- Data insert dengan nama aneh tapi aman

### 4.5 CORS Testing (Optional)

**Test dari domain berbeda:**

```javascript
fetch("http://localhost:3000/users", {
  method: "GET",
  headers: { "Content-Type": "application/json" },
})
  .then((r) => r.json())
  .then((d) => console.log(d));
```

**Current Behavior:**

- CORS belum diatur, client dari domain berbeda mungkin blocked

### 4.6 Error Handling - Invalid JSON

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d "invalid json{"
```

**Expected Response (Status 400):**

```json
{
  "error": "..."
}
```

### 4.7 Environment Variable Override

**Test:**

```bash
PORT=8080 DB_USER=custom_user node app.js
```

**Expected:**

- Server berjalan di port 8080
- Koneksi ke database dengan user `custom_user`

### 4.8 Dockerfile Security Scan

```bash
docker scan project-app-web:latest
```

**Expected:**

- Minimal vulnerabilities
- Non-root user digunakan (USER node)

### 4.9 Container Resource Limits

Update `docker-compose.yml` dengan limits:

```yaml
services:
  web:
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 256M
  db:
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 512M
```

**Test:**

```bash
docker compose up -d
docker stats
```

**Verifikasi:**

- CPU dan Memory usage sesuai limit

### 4.10 Graceful Shutdown

```bash
docker compose down
```

**Expected:**

- Container berhenti dengan clean
- Tidak ada orphaned processes
- Volume data persisten

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
- [ ] Image berhasil di-push ke Docker Hub
- [ ] Image bisa di-pull dan di-run dari Docker Hub
- [ ] Performance test (bulk insert)
- [ ] SQL Injection prevention
- [ ] Database retry logic

---

## Troubleshooting

### Container Exit Code 1

**Solusi:**

```bash
docker compose logs web-1
```

- Cek koneksi database
- Verifikasi credentials di `.env`

### Database Permission Denied

**Solusi:**

- Pastikan `DB_USER` dan `DB_PASSWORD` sama di `docker-compose.yml` dan `.env`
- Hapus volume lama: `docker volume rm project-app_db-data-fresh`

### Port 3000 Already in Use

**Solusi:**

```bash
docker compose down
lsof -i :3000
kill -9 <PID>
docker compose up
```

---

## Referensi

- [Express.js Docs](https://expressjs.com/)
- [MySQL Docker Hub](https://hub.docker.com/_/mysql)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Postman Docs](https://learning.postman.com/)

## Kesimpulan

Project App adalah aplikasi CRUD sederhana menggunakan Docker Compose, Express.js, dan MySQL. Saat ini alur yang tepat masih belum 100% dipahami, jadi dokumentasi ini dibuat sebagai bahan pengujian dan evaluasi.

Hal-hal utama yang sudah terlihat:

- Aplikasi sudah menggunakan Docker Compose untuk multi-container setup.
- Database MySQL disimpan ke volume agar data persisten.
- Endpoint CRUD dapat diuji lewat Postman, browser, atau `curl`.
- Terdapat logika retry untuk koneksi database.

Namun, alur lengkap deployment dan service interaction perlu dikaji ulang agar setup menjadi lebih jelas dan dapat dipakai dengan lebih percaya diri.
