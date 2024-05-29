const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../dao/sqldao.js');

/** Add client route
 * 
 *  Route to add a client into the database.
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
router.post('/add', async (req, res) => {
    console.log('POST /add');

    const body = req.body

    const clientname = body.clientname
    const organisation = body.organisation
    const targetaudience = body.targetaudience
    const email = body.email
    const phonenumber = body.phonenumber
    const contactperson = body.contactperson
    const address = body.address
    const kvknumber = body.kvknumber

    try {
        const pool = await poolPromise;
        querytodatabase = (`INSERT INTO [Client] VALUES ('${clientname}', '${organisation}', '${targetaudience}', '${email}', '${phonenumber}', '${contactperson}', '${address}', '${kvknumber}')`)
        console.log('EXECUTING QUERY ON DATABASE: ' + querytodatabase)
        const result = await pool.request().query(querytodatabase)
        res.json({
            status: 200,
            message: "Succesfully added client"
        });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Database Query Error' });
    }
});

module.exports = router;