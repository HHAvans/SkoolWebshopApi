const express = require('express');
const { sql, poolPromise } = require('./src/dao/sqldao.js');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const port = 300;


//Other routes
const userRoutes = require('./src/routes/userroutes.js')
const workshopRoutes = require('./src/routes/workshoproutes.js')

app.use('/user', userRoutes)
app.use('/workshop', workshopRoutes)


// Simple route for testing
app.get('/info', (req, res) => {
    console.log('GET /api/info');
    const info = {
        name: 'Express nodejs server programmeren 4',
        version: '1.0.0',
        description: 'Dit is de nodejs express server voor mijn programmeren 4 toets.'
    };
    res.json(info);
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