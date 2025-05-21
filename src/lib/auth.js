import jwt from 'jsonwebtoken';
import { getOne } from './db';

// Fungsi untuk membuat token JWT berdasarkan data user
export function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
}

// Fungsi untuk memverifikasi token JWT
export function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Token tidak valid');
    }
}

// Fungsi untuk mendapatkan data user dari token JWT
export async function getUserFromToken(token) {
    try {
        const decode = verifyToken(token);
        const user = await getOne('SELECT id, name, email, role, is_verified FROM users WHERE id = ?', [decode.id]);
        if (!user) {
            throw new Error('User tidak ditemukan');
        }
        return user;
    } catch (error) {
        throw new Error('Token tidak valid atau user tidak ditemukan');
    }
}

// Middleware untuk mengautentikasi user dari request
export async function authenticateUser(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Token tidak ditemukan');
        }

        const token = authHeader.substring(7);
        const user = await getUserFromToken(token);

        return user;
    } catch (error) {
        throw new Error('Autentikasi gagal: ' + error.message);
    }
}

// Fungsi untuk memeriksa role user apakah termasuk yang diizinkan
export function checkRole(user, allowedRoles = []) {
    if (!allowedRoles.includes(user.role)) {
        throw new Error('Hak akses tidak cukup');
    }
    return true;
}

// Middleware untuk memeriksa autentikasi sebelum menjalankan handler
export function requireAuth(handler) {
    return async (request) => {
        try {
            const authHeader = request.headers.get('authorization');

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return new Response(
                    JSON.stringify({ error: 'Token tidak ditemukan' }),
                    {
                        status: 401,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
            }

            const token = authHeader.substring(7);
            const decode = verifyToken(token);

            if (!decode) {
                return new Response(
                    JSON.stringify({ error: 'Token tidak valid' }),
                    {
                        status: 401,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
            }

            request.user = decode;

            return handler(request);
        } catch (error) {
            console.error('Error middleware autentikasi:', error);
            return new Response(
                JSON.stringify({ error: 'Error autentikasi' }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    };
}
