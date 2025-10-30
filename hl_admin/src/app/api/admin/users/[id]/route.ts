/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';
import { JwtPayload } from 'jsonwebtoken';

export async function PUT(request: NextRequest, context: any) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = await verifyToken(token) as JwtPayload;
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'project_manager')) {
            return NextResponse.json(
                { message: 'Forbidden' },
                { status: 403 }
            );
        }

        const { role } = await request.json();
        const { id } = context.params;
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return NextResponse.json(
                { message: 'Invalid user ID' },
                { status: 400 }
            );
        }

        // Update user role
        await pool.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, userId]
        );

        return NextResponse.json({
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('User role update error:', error);
        return NextResponse.json(
            { message: 'Failed to update user' },
            { status: 500 }
        );
    }
} 