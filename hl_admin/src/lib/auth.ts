/* eslint-disable */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './db';
import { ResultSetHeader } from 'mysql2';

// Use a more secure JWT secret with a fallback
const JWT_SECRET = process.env.JWT_SECRET || 'dreamway-holdings-admin-secret-key-2024-secure';

// Debug: Log the JWT secret being used (first 10 characters only for security)
console.log('JWT_SECRET from env:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('JWT_SECRET being used:', JWT_SECRET.substring(0, 10) + '...');

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: number, role: string): string {
    console.log('Generating token for user ID:', userId, 'with role:', role);
    console.log('Using JWT_SECRET:', JWT_SECRET.substring(0, 10) + '...');
    
    const payload = { userId, role };
    console.log('Token payload:', payload);
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    console.log('Generated token (first 20 chars):', token.substring(0, 20) + '...');
    
    return token;
}

export async function verifyToken(token: string) {
    try {
        console.log('Verifying token with secret:', JWT_SECRET.substring(0, 10) + '...');
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Token verified successfully:', decoded);
        return decoded;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

export async function createUser(email: string, password: string, name: string, role: string = 'user'): Promise<{ insertId: number }> {
    const hashedPassword = await hashPassword(password);
    const [result] = await pool.execute(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, role]
    ) as [ResultSetHeader, any];
    return { insertId: result.insertId };
}

export async function getUserByEmail(email: string) {
    const [rows] = (await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
    ) as unknown as [any[]]);
    return rows[0];
}

export async function getUserById(id: number) {
    const [rows] = (await pool.execute(
        'SELECT id, email, name, role FROM users WHERE id = ?',
        [id]
    ) as unknown as [any[]]);
    return rows[0];
} 