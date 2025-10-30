import { NextResponse } from 'next/server';

export async function POST() {
    try {
        // Logout is primarily handled on the client side by clearing localStorage
        // This endpoint can be used for server-side logout if needed in the future
        return NextResponse.json({
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
} 