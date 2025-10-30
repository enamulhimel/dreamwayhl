import { NextResponse } from 'next/server';
import { createUser, generateToken, getUserByEmail } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { name, email, password, role = 'user' } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        console.log('Signup attempt for:', { name, email, role });

        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            console.log('User already exists with email:', email);
            return NextResponse.json(
                { message: 'Email already registered' },
                { status: 400 }
            );
        }

        // Create new user
        console.log('Creating new user...');
        const result = await createUser(email, password, name, role);
        const userId = result.insertId;
        console.log('User created with ID:', userId);

        // Generate token
        console.log('Generating token for new user:', userId);
        const token = generateToken(userId, role);
        console.log('Token generated successfully for user:', userId);

        return NextResponse.json({
            token,
            role,
            message: 'Signup successful'
        });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
} 