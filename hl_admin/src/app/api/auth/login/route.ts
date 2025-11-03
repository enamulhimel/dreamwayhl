// import { NextResponse } from 'next/server';
// import { comparePasswords, generateToken, getUserByEmail } from '@/lib/auth';

// export async function POST(request: Request) {
//     try {
//         const { email, password } = await request.json();

//         if (!email || !password) {
//             return NextResponse.json(
//                 { message: 'Email and password are required' },
//                 { status: 400 }
//             );
//         }

//         console.log('Login attempt for email:', email);
//         const user = await getUserByEmail(email);

//         if (!user) {
//             console.log('User not found for email:', email);
//             return NextResponse.json(
//                 { message: 'Invalid email or password' },
//                 { status: 401 }
//             );
//         }

//         console.log('User found:', { id: user.id, name: user.name, role: user.role });
//         const isValidPassword = await comparePasswords(password, user.password);

//         if (!isValidPassword) {
//             console.log('Invalid password for user:', user.id);
//             return NextResponse.json(
//                 { message: 'Invalid email or password' },
//                 { status: 401 }
//             );
//         }

//         console.log('Password valid, generating token for user:', user.id);
//         const token = generateToken(user.id, user.role);
//         console.log('Token generated successfully');

//         return NextResponse.json({
//             token,
//             role: user.role,
//             message: 'Login successful'
//         });
//     } catch (error) {
//         console.error('Login error:', error);
//         return NextResponse.json(
//             { message: 'Internal server error' },
//             { status: 500 }
//         );
//     }
// } 

// app/api/auth/login/route.ts (App Router)
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';  // Install: npm install bcryptjs
import jwt from 'jsonwebtoken'; // Install: npm install jsonwebtoken
import mysql from 'mysql2/promise'; // Assuming you use mysql2

// DB pool (shared from your backend logic or recreate)
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-12345'; // Add to .env.local

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
    }

    // Get user from DB
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = (rows as any[])[0];

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Check password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    return NextResponse.json({ token, role: user.role });
  } catch (err: any) {
    console.error('Login API error:', err); // Logs to terminal
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}