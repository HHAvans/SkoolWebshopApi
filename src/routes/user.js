const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../dao/sqldao.js');

/** Get users route
 * 
 *  This route gets all the info of the users EXCEPT passwords and id's.
 * 
 *  EXPECTED JSON BODY
 
{
    "clientname": "Example Name",
    "organisation": "Example BV",
    "targetaudience": "Example people",
    "email": "example@mail.nl",
    "phonenumber": "31600000000",
    "contactperson": "Example person",
    "address": "Example 1",
    "kvknumber": "1"
}

 */
router.get('/all', async (req, res) => {
    console.log('GET /user/all');

    try {
        const pool = await poolPromise;
        console.log('EXECUTING QUERY ON DATABASE: SELECT * FROM [User]')
        const result = await pool.request().query('SELECT * FROM [User]');

         // Remove IDs and passwords from the result set
        const usersWithoutIdAndPassword = result.recordset.map(user => {
            const { UserId, Password, ...rest } = user;
            return rest;
        });

        res.json(usersWithoutIdAndPassword);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Database Query Error' });
    }
});

module.exports = router;