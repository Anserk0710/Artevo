import bcrypt from 'bcryptjs';
import { getOne } from "../../../lib/db";
import { generateToken } from "../../../lib/auth";

// Handler untuk login user
export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validasi input wajib diisi
        if (!email || !password) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Email dan password wajib diisi'
            }), { status: 400 });
        }

        // Cari user berdasarkan email
        const user = await getOne(
            'SELECT id, name, email, password, role, is_verified FROM users WHERE email = ?',
            [email]
        );

        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Email atau password salah'
            }), { status: 401 });
        }

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Email atau password salah'
            }), { status: 401 });
        }

        // Generate token JWT
        const token = generateToken(user);

        // Hapus password dari data user yang dikirim
        const { password: _, ...userWithoutPassword } = user;

        return new Response(JSON.stringify({
            success: true,
            message: 'Login berhasil!',
            data: {
                user: userWithoutPassword,
                token: token
            }
        }), { status: 200 });

    } catch (error) {
        console.error('Error saat login:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Terjadi kesalahan saat login',
            error: error.message
        }), { status: 500 });
    }
}
