/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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
        
        // Query the 'agent' table and map columns to match frontend expectations
        const [rows] = await pool.query(`
            SELECT 
                id,
                agent_name as name,
                agent_number as number,
                agent_image as image
            FROM agent
        `);
        
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Agents fetch error:', error);
        return NextResponse.json({ message: 'Failed to fetch agents' }, { status: 500 });
    }
} 