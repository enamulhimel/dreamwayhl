import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { JwtPayload } from 'jsonwebtoken';

interface CustomJwtPayload extends JwtPayload {
    userId: number;
    role: string;
}

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = await verifyToken(token) as CustomJwtPayload;
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json(
                { message: 'Forbidden' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '25');
        const offset = (page - 1) * pageSize;

        // Get total count
        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM visit');
        const total = (countResult as { total: number }[])[0].total;

        // Get paginated results
        const [rows] = await pool.query(
            'SELECT id, property_name, name, email, phone, date, time, message, entrytime as created_at FROM visit ORDER BY id DESC LIMIT ? OFFSET ?',
            [pageSize, offset]
        );

        return NextResponse.json({
            leads: rows,
            total,
            page,
            pageSize
        });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }
} 