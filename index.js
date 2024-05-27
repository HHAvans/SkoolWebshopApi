const express = require('express')
const db = require('./src/dao/sqldao.js')
const cors = require('cors')
const app = express()


// express.json zorgt dat we de body van een request kunnen lezen
app.use(express.json())
app.use(cors())

const port = 300

// Dit is een voorbeeld van een simpele route
app.get('/api/info', (req, res) => {
    console.log('GET /api/info')
    const info = {
        name: 'Express nodejs server programmeren 4',
        version: '1.0.0',
        description: 'Dit is de nodejs express server voor mijn programmeren 4 toets.'
    }
    res.json(info)
})

app.get('/api/user', (req, res) => {
    console.log('GET /api/user');

    db.getConnection(function (err, connection) {
        if (err) {
            console.error('Error getting a database connection:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        connection.query('SELECT Name FROM User', function (error, results, fields) {
            connection.release();

            if (error) {
                console.error('Error executing query:', error);
                res.status(500).json({ error: 'Database Query Error' });
            } else {
                res.json(results);
            }
        });
    });
});


// Route error handler
app.use((req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    })
})

// Hier komt je Express error handler te staan!
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || 'Internal Server Error',
        data: {}
    })
})

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`)
})