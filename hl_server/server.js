require('dotenv').config()
const express = require('express')
const app = express()
const mysql = require('mysql2')
const cors = require('cors')
const nodemailer = require('nodemailer');

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
  
  // Close database pool
  if (con) {
    con.end((err) => {
      if (err) {
        console.error('Error closing database pool:', err);
      } else {
        console.log('Database pool closed successfully');
      }
      
      // Exit process
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

const corsOptions = {
    origin: function(origin, callback) {
        // Define allowed origins
        const allowedOrigins = [
            'https://dreamwayhl.com',
            'https://www.dreamwayhl.com',
            "http://localhost:3000", 
            process.env.CORS_ORIGIN1, 
            process.env.CORS_ORIGIN2,"*",
        ].filter(Boolean); // Remove any undefined/empty origins
       
        // Check if the request origin is allowed
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy: Request origin not allowed'));
        }
    },
    credentials: true, // If you need to send cookies between domains
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
};

app.use(cors(corsOptions));

// Add error handler for CORS errors
app.use((err, req, res, next) => {
    if (err.message.includes('CORS policy')) {
        return res.status(403).json({
            error: 'Access Denied',
            message: 'Origin not allowed to access this API'
        });
    }
    next(err);
});

app.use(express.json({ limit: '10mb' })); // Add request size limit

// API Key authentication middleware
const apiKeyAuth = (req, res, next) => {
    // Skip auth for certain routes if needed
    if (req.path === '/' || req.path === '/test-db' || req.path === '/properties' || req.path === '/blogs') {
    return next();
}
    
    const apiKey = req.headers['x-api-key'];
    const expectedApiKey = process.env.API_KEY;
    
    
    if (!expectedApiKey) {
        console.warn('WARNING: API_KEY environment variable is not set');
        return res.status(500).json({
            error: 'Server Configuration Error',
            message: 'API key not configured'
        });
    }
    
    if (!apiKey || apiKey !== expectedApiKey) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or missing API key'
        });
    }
    
    next();
};

// Apply API key authentication to all routes
app.use(apiKeyAuth);

// Create a connection pool instead of a single connection
const con = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// Check if the pool is working
con.getConnection((err, connection) => {
    if (err) {
        console.error("Error getting database connection:", err);
    } else {
        console.log("Database pool initialized successfully");
        connection.release();
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});

app.get("/", (req, res) => {
    res.json({ message: 'access denied', status: 'running' })
})

app.get("/test-db", (req, res) => {
  con.getConnection((err, connection) => {
    if (err) {
      console.error("Connection error:", err);
      return res.status(500).json({
        error: "Database connection error",
        details: err.message,
        code: err.code
      });
    }
    
    connection.query("SELECT 1 as test", (queryErr, results) => {
      connection.release();
      
      if (queryErr) {
        console.error("Query error:", queryErr);
        return res.status(500).json({
          error: "Query error",
          details: queryErr.message,
          code: queryErr.code
        });
      }
      
      res.json({
        success: true,
        message: "Database connection successful",
        result: results
      });
    });
  });
});

app.get("/properties", (req, res) => {
  try {
    const userId = req.query.user_id;
    const projectStatus = req.query.project_status;
    const location = req.query.location;
    const fromHomepage = req.query.from_homepage === 'true';
    
    let query = "SELECT id, name, slug, img_thub, land_area, flat_size, building_type, project_status, location, address FROM properties ORDER BY home_serial ASC";
    let queryParams = [];
    let whereConditions = [];
    
    // Add userId filter if it exists
    if (userId) {
      whereConditions.push("user_id = ?");
      queryParams.push(userId);
    }
    
    // Add project_status filter if it exists and is not 'default'
    if (projectStatus && projectStatus !== 'default') {
      whereConditions.push("project_status = ?");
      queryParams.push(projectStatus);
    }
    
    // Add location filter if it exists and is not 'default'
    if (location && location !== 'default') {
      whereConditions.push("location = ?");
      queryParams.push(location);
    }
    
    // Build the final query with WHERE clause if needed
    if (whereConditions.length > 0) {
      query = query.replace("ORDER BY", "WHERE " + whereConditions.join(" AND ") + " ORDER BY");
    }
    
    // Add LIMIT 9 when the request is from homepage
    if (fromHomepage) {
      query += " LIMIT 9";
    }
    
    // Execute the query with proper error handling
    con.query(query, queryParams, function (err, result, fields) {
      if (err) {
        console.error("Database error in properties endpoint:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.send(result);
    });
  } catch (error) {
    console.error("Exception in properties endpoint:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/sproperties",(req,res) => {
    try {
        const slug = req.query.slug;
        
        if (!slug) {
            return res.status(400).json({ error: "Slug parameter is required" });
        }
        
        con.query("SELECT * FROM properties RIGHT JOIN amenities ON properties.id = amenities.id JOIN agent ON properties.agent_id = agent.id WHERE properties.slug = ?", [slug], function (err, result, fields) {
            if (err) {
                console.error("Database error in sproperties endpoint:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.send(result);
        });
    } catch (error) {
        console.error("Exception in sproperties endpoint:", error);
        res.status(500).json({ error: "Server error" });
    }
})

app.get("/review", (req, res) => {
    try {
        con.query("SELECT * FROM review Limit 12", function (err, result, fields) {
            if (err) {
                console.error("Database error in review endpoint:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.send(result);
        });
    } catch (error) {
        console.error("Exception in review endpoint:", error);
        res.status(500).json({ error: "Server error" });
    }
})

app.get("/similer", (req, res) => {
    try {
        const slug = req.query.slug;
        const size = req.query.flat_size;
        
        if (!slug || !size) {
            return res.status(400).json({ error: "Slug and flat_size parameters are required" });
        }
        
        con.query("SELECT id,name,slug,img_thub, land_area, flat_size, building_type, project_status, location, address FROM properties WHERE properties.slug != ? ORDER BY ABS(properties.flat_size - ?) LIMIT 3", [slug, size], function (err, result, fields) {
            if (err) {
                console.error("Database error in similer endpoint:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.send(result);
        });
    } catch (error) {
        console.error("Exception in similer endpoint:", error);
        res.status(500).json({ error: "Server error" });
    }
})

app.post("/contact", (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !phone || !subject || !message) {
            return res.status(400).json({ error: "All fields are required" });
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        
        const sql = "INSERT INTO contact (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)";
        const values = [name, email, phone, subject, message];
        
        con.query(sql, values, function (err, result) {
            if (err) {
                console.error("Error sending contact message:", err);
                return res.status(500).json({ error: "Error sending message" });
            }
            // Send email notification after successful database insertion
            sendContactEmail(name, email, phone, subject, message).catch(emailErr => {
                console.error("Failed to send contact email:", emailErr);
            });
            res.json({ message: "Message sent successfully" });
        });
    } catch (error) {
        console.error("Exception in contact endpoint:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Function to send contact form email with anti-spam improvements
async function sendContactEmail(name, email, phone, subject, message) {
    try {
        // Validate environment variables
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            throw new Error('SMTP configuration missing');
        }
        
        // Create a transporter object using SMTP transport with anti-spam settings
        let transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 465,
            secure: true, // true for 465
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            },
            // Add these properties to improve deliverability
            pool: true,           // Use pooled connections
            maxConnections: 5,    // Limit connections to avoid being flagged
            rateDelta: 1000,      // Minimum time between messages in ms
            rateLimit: 5          // Max number of messages in rateDelta time
        });

        // Create plain text version (important for anti-spam)
        const textContent = `
Contact Form Submission

From: ${name}
Email: ${email}
Phone: ${phone}
Subject: ${subject}

Message: ${message}

--
This is an automated message from Dreamway Holding Limited.
You can contact us at info@dreamwayhl.com
`;

        // Enhanced HTML with better formatting for inbox delivery
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Form Submission</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #dddddd;
      border-radius: 5px;
    }
    .header {
      background-color: #f8f8f8;
      padding: 15px;
      text-align: center;
      border-bottom: 1px solid #dddddd;
    }
    .content {
      padding: 20px;
    }
    .footer {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #dddddd;
      font-size: 12px;
      color: #777777;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Contact Form Submission</h2>
    </div>
    <div class="content">
      <p><strong>From:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong> ${message}</p>
    </div>
    <div class="footer">
      <p>This is an automated message from Dreamway Holding Limited.<br>
      You can contact us at <a href="mailto:info@dreamwayhl.com">info@dreamwayhl.com</a></p>
    </div>
  </div>
</body>
</html>
`;

        // Send mail with defined transport object and anti-spam headers
        let info = await transporter.sendMail({
            from: `"Dreamway Holding Ltd." <${process.env.SMTP_USER}>`,
            to: process.env.CONTACT_EMAIL || "info@dreamwayhl.com",
            cc: process.env.CONTACT_CC || "siyam.dreamway@gmail.com",
            subject: `New Contact: ${subject}`,
            text: textContent,
            html: htmlContent,
            headers: {
                'X-Priority': '3',
                'Precedence': 'Bulk',
                'X-MSMail-Priority': 'Normal',
                'X-Mailer': 'Nodemailer',
                'List-Unsubscribe': `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`
            }
        });

        console.log("Email sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error; // Re-throw to be handled by caller
    }
}

app.post("/visit", (req, res) => {
    try {
      const { name, property_name, email, phone, date, time, message } = req.body;
      
      // Validate required fields
      if (!name || !email || !phone || !date || !time || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      
      const sql = "INSERT INTO visit (name, property_name, email, phone, date, time, message) VALUES (?, ?, ?, ?, ?, ?, ?)";
      const values = [name, property_name, email, phone, date, time, message];
      con.query(sql, values, function (err, result) {
        if (err) {
          console.error("Error setting visiting Time:", err);
          return res.status(500).json({ error: "Error sending message" });
        }
        // Send email notification after successful database insertion
        sendConfirmationEmail(name, property_name, email, phone, date, time, message).catch(emailErr => {
          console.error("Failed to send confirmation email:", emailErr);
        });
        res.json({ message: "Booking Successfully" });
      });
    } catch (error) {
      console.error("Exception in visit endpoint:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Function to send confirmation email with anti-spam improvements
  async function sendConfirmationEmail(name, property_name, email, phone, date, time, message) {
    try {
        // Validate environment variables
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            throw new Error('SMTP configuration missing');
        }
        
        // Create a transporter object using SMTP transport with anti-spam settings
        let transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 465,
            secure: true, // true for 465
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            },
            // Add these properties to improve deliverability
            pool: true,           // Use pooled connections
            maxConnections: 5,    // Limit connections to avoid being flagged
            rateDelta: 1000,      // Minimum time between messages in ms
            rateLimit: 5          // Max number of messages in rateDelta time
        });
  
        // Format date for better readability
        const formattedDate = new Date(date).toLocaleDateString();
        
        // Create plain text version (important for anti-spam)
        const textContent = `
Property Visit Confirmation

Dear ${name},

Thank you for booking a visit to ${property_name}. Your booking details are:

Date: ${formattedDate}
Time: ${time}
Contact: ${phone}

Your message: ${message}

If you need to reschedule or have any questions, please contact us.

Regards,
Property Management Team

--
This is an automated message from Dreamway Holding Limited.
You can contact us at info@dreamwayhl.com
`;
  
        // Enhanced HTML with better formatting for inbox delivery
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Property Visit Confirmation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #dddddd;
      border-radius: 5px;
    }
    .header {
      background-color: #f8f8f8;
      padding: 15px;
      text-align: center;
      border-bottom: 1px solid #dddddd;
    }
    .content {
      padding: 20px;
    }
    .footer {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #dddddd;
      font-size: 12px;
      color: #777777;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Property Visit Confirmation</h2>
    </div>
    <div class="content">
      <p>Dear ${name},</p>
      <p>Thank you for booking a visit to <strong>${property_name}</strong>. Your booking details are:</p>
      <ul>
        <li><strong>Date:</strong> ${formattedDate}</li>
        <li><strong>Time:</strong> ${time}</li>
        <li><strong>Contact:</strong> ${phone}</li>
      </ul>
      <p><strong>Your message:</strong> ${message}</p>
      <p>If you need to reschedule or have any questions, please contact us.</p>
      <p>Regards,<br>IT Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message from Dreamway Holding Limited.<br>
      You can contact us at <a href="mailto:info@dreamwayhl.com">info@dreamwayhl.com</a></p>
    </div>
  </div>
</body>
</html>
`;
  
        // Send mail with defined transport object and anti-spam headers
        let info = await transporter.sendMail({
            from: `"Dreamway Holding Ltd." <${process.env.SMTP_USER}>`,
            to: email,
            cc: process.env.CONTACT_EMAIL || "info@dreamwayhl.com",
            subject: `Booking Confirmation for ${property_name}`,
            text: textContent,
            html: htmlContent,
            headers: {
                'X-Priority': '3',
                'Precedence': 'Bulk',
                'X-MSMail-Priority': 'Normal',
                'X-Mailer': 'Nodemailer',
                'List-Unsubscribe': `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`
            }
        });
  
        console.log("Email sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error; // Re-throw to be handled by caller
    }
  }

app.post("/newsletter", (req, res) => {
    try {
        const {email, name } = req.body;
        
        // Validate required fields
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        
        const sql = "INSERT INTO newsletter (email,name) VALUES (?,?)";
        const values = [email, name || ''];

        con.query(sql, values, function (err, result) {
            if (err) {
                console.error("Error subscribing to newsletter:", err);
                return res.status(500).json({ error: "Error subscribing newsletter" });
            }
            res.json({ message: "Subscribed successfully" });
        });
    } catch (error) {
        console.error("Exception in newsletter endpoint:", error);
        res.status(500).json({ error: "Server error" });
    }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
    }
});

// Graceful shutdown for HTTP server
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('HTTP server closed');
        gracefulShutdown('SIGTERM');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('HTTP server closed');
        gracefulShutdown('SIGINT');
    });
});

app.get("/blogs", (req, res) => {
  try {
    const sql = `
      SELECT 
        id,
        title,
        slug,
        content,
        excerpt,
        category,
        publishedAt,
        updatedAt,
        createdAt,
        coverImage AS coverImageUrl,
        author
      FROM blogs
      ORDER BY publishedAt DESC
    `;

    con.query(sql, (err, rows) => {
      if (err) {
        console.error("DB error /blogs:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // Transform to the exact shape the front-end expects
      const formatted = rows.map(row => ({
        id: row.id,
        documentId: row.id.toString(),
        title: row.title,
        slug: row.slug,
        content: row.content,
        excerpt: row.excerpt || "",
        category: row.category || null,
        publishedAt: row.publishedAt,
        updatedAt: row.updatedAt,
        createdAt: row.createdAt,
        coverImage: row.coverImageUrl
          ? { url: row.coverImageUrl }
          : null,
        author: row.author
          ? { name: row.author }
          : null,
        // optional Bangla fields – keep null if you don’t have them
        title_bangla: null,
        content_bangla: null
      }));

      res.json(formatted);
    });
  } catch (e) {
    console.error("Exception /blogs:", e);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/blogs/:slug", (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ error: "Slug required" });

    const sql = `
      SELECT 
        id,
        title,
        slug,
        content,
        excerpt,
        category,
        publishedAt,
        updatedAt,
        createdAt,
        coverImage AS coverImageUrl,
        author
      FROM blogs
      WHERE slug = ?
      LIMIT 1
    `;

    con.query(sql, [slug], (err, rows) => {
      if (err) {
        console.error("DB error /blogs/:slug:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (rows.length === 0) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      const row = rows[0];
      const post = {
        id: row.id,
        documentId: row.id.toString(),
        title: row.title,
        slug: row.slug,
        content: row.content,
        excerpt: row.excerpt || "",
        category: row.category || null,
        publishedAt: row.publishedAt,
        updatedAt: row.updatedAt,
        createdAt: row.createdAt,
        coverImage: row.coverImageUrl ? { url: row.coverImageUrl } : null,
        author: row.author ? { name: row.author } : null,
        title_bangla: null,
        content_bangla: null
      };

      res.json(post);
    });
  } catch (e) {
    console.error("Exception /blogs/:slug:", e);
    res.status(500).json({ error: "Server error" });
  }
});