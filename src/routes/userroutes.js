const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../dao/sqldao.js');

// Route to get all users
router.get('/all', async (req, res) => {
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

module.exports = router;
