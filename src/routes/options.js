const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../dao/sqldao.js');

router.get("/all-clients", async (req, res) => {
    console.log("GET /all-clients");

    try {
        const pool = await poolPromise;
        const query = "SELECT ClientId, ClientName FROM [Client]";
        console.log("EXECUTING QUERY ON DATABASE: " + query);
        const result = await pool.request().query(query);

        // extract data
        const options = result.recordset.map(row => ({
            value: row.ClientId,
            text: row.ClientName
        }));

        res.json({
            status: 200,
            data: result.recordset,
            message:  "Succesfully retrieved the client's name",
        });
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ error: "Database Query Error" });
    }
});

module.exports = router;
