import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'dreamway_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 60000, // 60 seconds
});

// Add error handling for pool events
pool.on('connection', () => {
    console.log('New database connection established');
});

pool.on('acquire', () => {
    console.log('Connection acquired from pool');
});

pool.on('release', () => {
    console.log('Connection released back to pool');
});

// Graceful shutdown function
export const closePool = async () => {
    try {
        await pool.end();
        console.log('Database pool closed successfully');
    } catch (error) {
        console.error('Error closing database pool:', error);
    }
};

export default pool; 