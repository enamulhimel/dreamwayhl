import { NextResponse } from 'next/server';
import { comparePasswords, generateToken, getUserByEmail } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required' },
                { status: 400 }
            );
        }

        console.log('Login attempt for email:', email);
        const user = await getUserByEmail(email);

        if (!user) {
            console.log('User not found for email:', email);
            return NextResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        console.log('User found:', { id: user.id, name: user.name, role: user.role });
        const isValidPassword = await comparePasswords(password, user.password);

        if (!isValidPassword) {
            console.log('Invalid password for user:', user.id);
            return NextResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        console.log('Password valid, generating token for user:', user.id);
        const token = generateToken(user.id, user.role);
        console.log('Token generated successfully');

        return NextResponse.json({
            token,
            role: user.role,
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
} 