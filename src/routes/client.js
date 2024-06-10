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
    "contactperson": "Example person",
    "email": "example@mail.nl",
    "phonenumber": "31600000000",
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
        querytodatabase = (`INSERT INTO [Client] (
                [ClientName],
                [Organisation],
                [TargetAudience],
                [ContactPerson],
                [Email],
                [PhoneNumber],
                [Address],
                [KvkNumber]
            ) VALUES ('${clientname}', '${organisation}', '${targetaudience}', '${email}', '${phonenumber}', '${contactperson}', '${address}', '${kvknumber}')`)
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

router.get("/all", async (req, res) => {
    console.log("GET /all");

    try {
        const pool = await poolPromise;
        const query = "SELECT * FROM [Client]";
        console.log("EXECUTING QUERY ON DATABASE: " + query);
        const result = await pool.request().query(query);
        res.json({
          status: 200,
          message: "Succesfully retrieved all clients",
          data: result.recordset,
        });
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ error: "Database Query Error" });
    }
});

router.get("/allnames", async (req, res) => {
    console.log("GET /allnames");

    try {
        const pool = await poolPromise;
        const query = "SELECT ClientName FROM [Client]";
        console.log("EXECUTING QUERY ON DATABASE: " + query);
        const result = await pool.request().query(query);
        res.status(200).json({
            status: 200,
            message: "Succesfully retrieved all client names",
            data: result.recordset,
        });
    } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Database Query Error" });
    }
});

router.post("/address", async (req, res) => {
    console.log("POST /address");

    try {
        const pool = await poolPromise;
        const query = "SELECT Address FROM [Client] WHERE ClientName = '" + req.body.clientname + "'";
        console.log("EXECUTING QUERY ON DATABASE: " + query);
        const result = await pool.request().query(query);

        res.status(200).json({
            status: 200,
            message: "Succesfully retrieved client address",
            data: result.recordset,
        });
    } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Database Query Error" });
    }
});

module.exports = router;
