import bcrypt from 'bcryptjs';
import { insertData, getOne } from "../../../lib/db";
import { generateToken } from "../../../lib/auth";

// Handler untuk registrasi user baru
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, password, role = 'buyer' } = body;

        // Validasi input wajib diisi
        if (!name || !email || !password) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Name, email, dan password harus diisi'
            }), { status: 400 });
        }

        // Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Email tidak valid'
            }), { status: 400 });
        }

        // Validasi panjang password minimal 8 karakter
        if (password.length < 8) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Password harus lebih dari 8 karakter'
            }), { status: 400 });
        }

        // Validasi role yang diperbolehkan
        const allowedRoles = ['buyer', 'seller'];
        if (!allowedRoles.includes(role)) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Role tidak diizinkan'
            }), { status: 400 });
        }

        // Cek apakah email sudah terdaftar
        const existingUser = await getOne(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Email sudah terdaftar'
            }), { status: 400 });
        }

        // Hash password sebelum disimpan
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert data user baru ke database
        const userId = await insertData(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );

        // Ambil data user baru yang sudah disimpan
        const newUser = await getOne(
            'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
            [userId]
        );

        // Generate token JWT untuk user baru
        const token = generateToken(newUser);

        return new Response(JSON.stringify({
            success: true,
            message: 'Registrasi berhasil',
            data: {
                user: newUser,
                token: token
            }
        }), { status: 201 });

    } catch (error) {
        console.error('Error saat registrasi:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Terjadi kesalahan saat registrasi'
        }), { status: 500 });
    }
}
