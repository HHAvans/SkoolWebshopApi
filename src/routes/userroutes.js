const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../dao/sqldao.js');

// Route to get all users
router.get('/all', async (req, res) => {
    console.log('GET /user/all');

    try {
        const pool = await poolPromise;
        console.log('EXECUTING QUERY ON DATABASE: SELECT * FROM [User]')
        const result = await pool.request().query('SELECT * FROM [User]');

         // Remove the 'id' property from each user
         const usersWithoutId = result.recordset.map(user => {
            const { UserId, ...userWithoutId } = user;
            return userWithoutId;
        });

        res.json(usersWithoutId);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Database Query Error' });
    }
});

module.exports = router;
