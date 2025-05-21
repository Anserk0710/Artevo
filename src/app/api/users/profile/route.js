import { NextResponse } from "next/server";
import { verifyToken } from "../../../lib/auth";
import db from "../../../lib/db";
import bcrypt from "bcryptjs";

// Handler untuk mendapatkan data profile user berdasarkan token yang valid
export async function GET(request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decode = verifyToken(token);

        if (!decode) {
            return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
        }

        // Query data user berdasarkan id dari token yang sudah didecode
        const [rows] = await db.execute(
            'SELECT id, name, email, role, profile_image, phone, address, is_verified, created_at FROM users WHERE id = ?',
            [decode.id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
        }

        const user = rows[0];

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile_image: user.profile_image,
                phone: user.phone,
                address: user.address,
                is_verified: user.is_verified,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Gagal mengambil data profile user:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

// Handler untuk memperbarui data profile user, termasuk opsi mengganti password
export async function PUT(request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decode = verifyToken(token);

        if (!decode) {
            return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
        }

        const body = await request.json();
        const { name, phone, address, currentPassword, newPassword } = body;

        // Validasi nama minimal 7 karakter
        if (!name || name.trim().length < 7) {
            return NextResponse.json({ error: 'Nama harus diisi dan minimal 7 karakter' }, { status: 400 });
        }

        if (newPassword) {
            // Jika ingin mengganti password, currentPassword harus diisi
            if (!currentPassword) {
                return NextResponse.json({ error: 'Current password diperlukan untuk mengganti password' }, { status: 400 });
            }

            // Validasi panjang password baru minimal 8 karakter
            if (newPassword.length < 8) {
                return NextResponse.json({ error: 'Password harus diisi dan minimal 8 karakter' }, { status: 400 });
            }

            // Ambil password lama dari database untuk validasi
            const [userRows] = await db.execute('SELECT password FROM users WHERE id = ?', [decode.id]);

            if (userRows.length === 0) {
                return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, userRows[0].password);
            if (!isPasswordValid) {
                return NextResponse.json({ error: 'Password lama tidak cocok' }, { status: 400 });
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            // Update data user termasuk password baru
            await db.execute(
                'UPDATE users SET name = ?, phone = ?, address = ?, updated_at = NOW() , password = ? WHERE id = ?',
                [name.trim(), phone || null, address || null, hashedNewPassword, decode.id]
            );
        } else {
            // Update data user tanpa mengganti password
            await db.execute(
                'UPDATE users SET name = ?, phone = ?, address = ?, updated_at = NOW() WHERE id = ?',
                [name.trim(), phone || null, address || null, decode.id]
            );
        }

        // Ambil data user terbaru setelah update
        const [updatedRows] = await db.execute(
            'SELECT id, name, email, role, profile_image, phone, address, is_verified, created_at FROM users WHERE id = ?',
            [decode.id]
        );

        return NextResponse.json({
            success: true,
            message: 'Profile berhasil diupdate',
            user: updatedRows[0]
        });
    } catch (error) {
        console.error('Gagal update user profile', error);
        return NextResponse.json({ error: 'Terjadi kesalahan saat memperbarui profile' }, { status: 500 });
    }
}
