# ArtEvo Backend

## Deskripsi Proyek
ArtEvo Backend adalah layanan backend yang menyediakan API untuk manajemen user, autentikasi, dan data terkait aplikasi ArtEvo. Backend ini menggunakan Next.js API Routes dengan koneksi database MySQL dan autentikasi menggunakan JWT.

## Fitur
- Registrasi user dengan validasi dan hashing password
- Login user dengan verifikasi password dan token JWT
- Mendapatkan dan memperbarui profil user dengan autentikasi token
- Endpoint untuk mengetes koneksi database dan mengambil data contoh
- Middleware autentikasi dan pengecekan role user

## Teknologi
- Node.js
- Next.js API Routes
- MySQL dengan mysql2/promise
- JSON Web Token (JWT)
- bcryptjs untuk hashing password

## Instalasi

1. Clone repository ini:
   ```
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Buat file `.env` di root project dan isi variabel lingkungan berikut:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=artevo_db
   DB_PORT=3306
   JWT_SECRET=your_jwt_secret_key
   ```

4. Jalankan server development:
   ```
   npm run dev
   ```

## Struktur Folder

- `src/app/api/` - Folder berisi API routes
  - `auth/` - Endpoint autentikasi (register, login)
  - `users/profile/` - Endpoint untuk profile user
  - `test-db/` - Endpoint untuk mengetes koneksi database
- `src/lib/` - Library utilitas seperti koneksi database dan autentikasi

## Endpoint API

### Registrasi User
- URL: `/api/auth/register`
- Method: POST
- Body:
  ```json
  {
    "name": "Nama User",
    "email": "email@example.com",
    "password": "password123",
    "role": "buyer" // atau "seller"
  }
  ```
- Response:
  - Success: 201 Created dengan data user dan token JWT
  - Error: 400 Bad Request jika validasi gagal

### Login User
- URL: `/api/auth/login`
- Method: POST
- Body:
  ```json
  {
    "email": "email@example.com",
    "password": "password123"
  }
  ```
- Response:
  - Success: 200 OK dengan data user dan token JWT
  - Error: 401 Unauthorized jika email atau password salah

### Get Profile User
- URL: `/api/users/profile`
- Method: GET
- Headers:
  - Authorization: Bearer {token}
- Response:
  - Success: 200 OK dengan data profile user
  - Error: 401 Unauthorized jika token tidak valid

### Update Profile User
- URL: `/api/users/profile`
- Method: PUT
- Headers:
  - Authorization: Bearer {token}
- Body:
  ```json
  {
    "name": "Nama Baru",
    "phone": "08123456789",
    "address": "Alamat baru",
    "currentPassword": "passwordlama", // opsional jika ingin ganti password
    "newPassword": "passwordbaru" // opsional jika ingin ganti password
  }
  ```
- Response:
  - Success: 200 OK dengan data profile terbaru
  - Error: 400 Bad Request jika validasi gagal

### Test Koneksi Database
- URL: `/api/test-db`
- Method: GET
- Response:
  - Success: 200 OK dengan status koneksi dan data contoh
  - Error: 500 Internal Server Error jika koneksi gagal

## Variabel Lingkungan (Environment Variables)
- `DB_HOST` - Host database MySQL
- `DB_USER` - User database
- `DB_PASSWORD` - Password database
- `DB_NAME` - Nama database
- `DB_PORT` - Port database (default 3306)
- `JWT_SECRET` - Secret key untuk JWT

## Cara Penggunaan
1. Jalankan backend dengan `npm run dev`.
2. Gunakan tools seperti Postman atau frontend untuk mengakses endpoint API.
3. Sertakan token JWT pada header Authorization untuk endpoint yang membutuhkan autentikasi.

## Lisensi
Proyek ini menggunakan lisensi MIT.

---

Jika ada pertanyaan atau masalah, silakan hubungi pengembang.
