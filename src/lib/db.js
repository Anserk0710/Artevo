import mysql from 'mysql2/promise';

// Konfigurasi koneksi database menggunakan environment variables
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Membuat pool koneksi database
const pool = mysql.createPool(dbConfig);

// Fungsi untuk mengetes koneksi database
export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Berhasil terkoneksi ke database');
        connection.release();
        return true;
    } catch (error) {
        console.error('Gagal koneksi ke database:', error.message);
        return false;
    }
}

// Fungsi untuk mengeksekusi query dengan parameter opsional
export async function executeQuery(query, params = []) {
    try {
        const [results] = await pool.execute(query, params);
        return results;
    } catch (error) {
        console.error('Error mengeksekusi query:', error.message);
        throw error;
    }
}

// Fungsi untuk mengambil satu baris data dari query
export async function getOne(query, params = []) {
    const result = await executeQuery(query, params);
    return result[0];
}

// Fungsi untuk mengambil banyak baris data dari query
export async function getMany(query, params = []) {
    const result = await executeQuery(query, params);
    return result;
}

// Fungsi untuk memasukkan data baru ke database
export async function insertData(query, params = []) {
    const result = await executeQuery(query, params);
    return result.insertId;
}

// Fungsi untuk memperbarui data di database
export async function updateData(query, params = []) {
    const result = await executeQuery(query, params);
    return result.affectedRows;
}

// Fungsi untuk menghapus data dari database
export async function deleteData(query, params = []) {
    const result = await executeQuery(query, params);
    return result.affectedRows;
}

export default pool;
