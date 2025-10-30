import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';
import { JwtPayload } from 'jsonwebtoken';

interface CustomJwtPayload extends JwtPayload {
    userId: number;
    role: string;
}

interface VisitRecord {
    id: number;
    property_name: string;
    entrytime: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    created_at: string;
}

export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decoded = await verifyToken(token) as CustomJwtPayload;
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build WHERE clause based on filters
        let whereClause = '';
        let params: (string | number)[] = [];

        if (month && year) {
            whereClause = 'WHERE MONTH(entrytime) = ? AND YEAR(entrytime) = ?';
            params = [parseInt(month), parseInt(year)];
        } else if (startDate && endDate) {
            whereClause = 'WHERE DATE(entrytime) BETWEEN ? AND ?';
            params = [startDate, endDate];
        }

        // Get all leads with property information
        const leadsQuery = `
            SELECT v.*, v.property_name 
            FROM visit v 
            ${whereClause}
            ORDER BY v.entrytime DESC
        `;
        
        const [leads] = await pool.query(leadsQuery, params);

        // Calculate property statistics
        const propertyStats: { [key: string]: number } = {};
        (leads as VisitRecord[]).forEach((lead: VisitRecord) => {
            const propertyName = lead.property_name || 'Unknown Property';
            propertyStats[propertyName] = (propertyStats[propertyName] || 0) + 1;
        });

        // Calculate monthly statistics
        const monthlyStats: { [key: string]: number } = {};
        (leads as VisitRecord[]).forEach((lead: VisitRecord) => {
            const date = new Date(lead.entrytime);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1;
        });

        // Calculate weekly statistics
        const weeklyStats: { [key: string]: number } = {};
        (leads as VisitRecord[]).forEach((lead: VisitRecord) => {
            const date = new Date(lead.entrytime);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekKey = weekStart.toISOString().split('T')[0];
            weeklyStats[weekKey] = (weeklyStats[weekKey] || 0) + 1;
        });

        // Calculate conversion rates (mock data for now)
        const conversionRates: { [key: string]: number } = {};
        Object.keys(propertyStats).forEach(property => {
            // Mock conversion rate between 5% and 25%
            conversionRates[property] = Math.random() * 20 + 5;
        });

        // Get total leads count
        const totalQuery = `SELECT COUNT(*) as total FROM visit ${whereClause}`;
        const [totalResult] = await pool.query(totalQuery, params);
        const total = (totalResult as { total: number }[])[0].total;

        return NextResponse.json({
            leads,
            total,
            propertyStats,
            monthlyStats,
            weeklyStats,
            conversionRates
        });

    } catch (error) {
        console.error('Analytics API error:', error);
        
        // Check for specific database errors
        if (error instanceof Error) {
            if (error.message.includes('Connection lost')) {
                return NextResponse.json(
                    { error: 'Database connection error. Please try again.' },
                    { status: 503 }
                );
            }
            if (error.message.includes('ER_NO_SUCH_TABLE')) {
                return NextResponse.json(
                    { error: 'Analytics data not available' },
                    { status: 404 }
                );
            }
        }
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 