const express = require('express');
const { sql, poolPromise } = require('./src/dao/sqldao.js');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const port = 300;

// Simple route for testing
app.get('/api/info', (req, res) => {
    console.log('GET /api/info');
    const info = {
        name: 'Express nodejs server programmeren 4',
        version: '1.0.0',
        description: 'Dit is de nodejs express server voor mijn programmeren 4 toets.'
    };
    res.json(info);
});

// Route to get all users
app.get('/user/all', async (req, res) => {
    console.log('GET /user/all');

    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM [User]');
        res.json(result.recordset);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Database Query Error' });
    }
});

// Add workshop
app.post('/workshop', async (req, res) => {
    console.log('POST /workshop');

    const body = req.body

    const name = body.name
    const category = body.category
    const requirements = body.requirements
    const description = body.description

    try {
        const pool = await poolPromise;
        querytodatabase = (`INSERT INTO [Workshop] VALUES ('${name}', '${category}', '${requirements}', '${description}')`)
        console.log('EXECUTING QUERY ON DATABASE: ')
        console.log(querytodatabase)
        res.json({
            status: 200,
            message: "Succesfully added workshop"
        });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Database Query Error' });
    }
});

// Route error handler
app.use((req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    });
});

// Express error handler
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || 'Internal Server Error',
        data: {}
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});