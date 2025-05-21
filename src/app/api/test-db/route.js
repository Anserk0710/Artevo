import { testConnection, getMany } from "../../../lib/db";

// Handler untuk mengetes koneksi database dan mengambil data contoh
export async function GET(request) {
    try {
        const isConnected = await testConnection();
        if (!isConnected) {
            return new Response(JSON.stringify({ message: 'Koneksi database gagal' }), { status: 500 });
        }

        // Mengambil semua data kategori
        const categories = await getMany('SELECT * FROM categories');
        // Menghitung total user
        const userCount = await getMany('SELECT COUNT(*) as total FROM users');

        return new Response(JSON.stringify({
            success: true,
            message: 'Koneksi database berhasil',
            data: {
                categories: categories,
                userCount: userCount[0].total,
                timestamp: new Date().toISOString(),
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error test koneksi database:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Test koneksi database gagal',
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
