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

// Redis connection
// const redisClient = redis.createClient({
//     host: 'redis',
//     port: 6379,
// });
// Redis connection
const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:6379`
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('end', () => {
    console.log('Redis connection closed');
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

redisClient.connect().catch((err) => {
    console.error('Failed to connect to Redis:', err);
});

// API Endpoints - for front
app.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

// GET /api/cache → Checks Redis and returns a cached message or fetches from the database
app.get('/api/cache', async (req, res) => {
    const cacheKey = 'cached_message';

    try {
        // Check Redis for cached data
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            // If cached data exists, return it
            return res.json({ message: JSON.parse(cachedData) });
        } else {
            // If no cached data, fetch from the database
            const sql = 'SELECT text FROM messages ORDER BY created_at DESC LIMIT 1';
            db.query(sql, (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to fetch from database' });
                }

                if (results.length > 0) {
                    const message = results[0].text;

                    // Cache the message in Redis for 1 hour
                    redisClient.setEx(cacheKey, 30, JSON.stringify(message));

                    // Return the message
                    return res.json({ message });
                } else {
                    return res.json({ message: 'No messages found in the database' });
                }
            });
        }
    } catch (err) {
        console.error('Redis error:', err);
        return res.status(500).json({ error: 'Failed to fetch from cache' });
    }
});

// Add a new endpoint to clear just the message cache
app.get('/api/cache/reset', async (req, res) => {
    try {
      await redisClient.del('cached_message');
      res.json({ message: 'Cache cleared successfully' });
    } catch (err) {
      console.error('Failed to clear cache:', err);
      res.status(500).json({ error: 'Failed to clear cache' });
    }
  });

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