const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../dao/sqldao.js');

/** Add workshop route
 * 
 *  Adds a workshop row to the database
 * 
 *  EXPECTED JSON BODY
 
{
    "name": "Graffiti",
    "category": "Outdoor",
    "requirements": "",
    "description": "Workshop graffiti"
}

 */
router.post('/add', async (req, res) => {
    console.log('POST /add');

    const body = req.body

    const name = body.name
    const category = body.category
    const requirements = body.requirements
    const description = body.description

    try {
        const pool = await poolPromise;
        querytodatabase = (`INSERT INTO [Workshop] VALUES ('${name}', '${category}', '${requirements}', '${description}')`)
        console.log('EXECUTING QUERY ON DATABASE: ' + querytodatabase)
        const result = await pool.request().query(querytodatabase)
        res.json({
            status: 200,
            message: "Succesfully added workshop"
        });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Database Query Error' });
    }
});

module.exports = router;
