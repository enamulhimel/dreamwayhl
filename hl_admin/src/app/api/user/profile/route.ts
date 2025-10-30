/* eslint-disable */
import { NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import pool from '@/lib/db';

function hasUserId(obj: any): obj is { userId: number } {
    return obj && typeof obj === 'object' && 'userId' in obj;
}

export async function GET(request: Request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            console.log('No token provided');
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        console.log('Token received:', token.substring(0, 20) + '...');
        
        const decoded = await verifyToken(token);
        console.log('Decoded token:', decoded);
        
        if (!hasUserId(decoded)) {
            console.log('Token does not contain userId');
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        console.log('Fetching user with ID:', decoded.userId);
        const user = await getUserById(decoded.userId);
        console.log('User found:', user);
        
        if (!user) {
            console.log('User not found for ID:', decoded.userId);
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ message: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const decoded = await verifyToken(token);
        if (!hasUserId(decoded)) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const { name, email } = await request.json();

        if (!name || !email) {
            return NextResponse.json(
                { message: 'Name and email are required' },
                { status: 400 }
            );
        }

        // Check if email is already taken by another user
        const [existingUsers] = (await pool.execute(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [email, decoded.userId]
        ) as unknown as [any[]]);

        if (existingUsers.length > 0) {
            return NextResponse.json(
                { message: 'Email already taken' },
                { status: 400 }
            );
        }

        // Update user profile
        await pool.execute(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [name, email, decoded.userId]
        );

        return NextResponse.json({
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
    }
} 