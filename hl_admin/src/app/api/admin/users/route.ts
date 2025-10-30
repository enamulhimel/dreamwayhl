/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';

function hasRole(obj: any): obj is { role: string } {
    return obj && typeof obj === 'object' && 'role' in obj;
}

export async function GET(request: Request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const decoded = await verifyToken(token);
        if (!hasRole(decoded) || (decoded.role !== 'admin' && decoded.role !== 'project_manager')) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
        const [rows] = await pool.query('SELECT * FROM users');
        return NextResponse.json(rows);
    } catch {
        return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
    }
} 