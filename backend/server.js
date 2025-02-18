const express = require('express');
const mysql = require('mysql2');
const redis = require('redis');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());

app.use(cors({
    origin: '*', // Allow any origin (use the frontend's URL if necessary)
    methods: ['GET', 'POST', 'OPTIONS'],  // Allow OPTIONS as well
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],  // Allow the necessary headers
}));

// Handle preflight requests (OPTIONS)
app.options('/api/message', cors());  // Respond to OPTIONS requests on the /api/message route

//MySQL connection
const db = mysql.createConnection({
    host: 'db',
    user: 'root',
    password: 'password',
    database: 'appdb',
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// const redisClient = redis.createClient({
//     host: 'redis',
//     port: 6379,
// });

// redisClient.on('connect', () => {
//     console.log('Connected to Redis');
// });

// API Endpoints - for front
app.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

// app.get('/api/cache', async (req, res) => {
//     const cacheKey = 'cached_message';

//     redisClient.get(cacheKey, async (err, data) => {
//         if (err) throw err;

//         if (data) {
//             res.json({ message: JSON.parse(data) });
//         } else {
//             const message = { message: 'Fetched from database' };
//             redisClient.setex(cacheKey, 3600, JSON.stringify(message)); // Cache for 1 hour
//             res.json(message);
//         }
//     });
// });


// GET /api/messages → Fetches all messages from the database
app.get('/api/messages', (req, res) => {
    const sql = 'SELECT * FROM messages ORDER BY created_at DESC';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch messages' });
        }
        res.json(results);
    });
});

// POST /api/messages → Adds a new message to the database
app.post('/api/messages', (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Message text is required' });
    }

    const sql = 'INSERT INTO messages (text) VALUES (?)';

    db.query(sql, [text], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to add message' });
        }
        res.json({ message: 'Message added!', id: result.insertId });
    });
});


app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
});