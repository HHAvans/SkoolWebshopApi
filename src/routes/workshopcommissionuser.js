const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../dao/sqldao');

// user signs up for a workshop in an assignment
// the status gets changed to pending - "Afwachtend"

// bekijk de id's -- moeten er dus al zijn en erin gezet worden.
router.post('/add', async (req, res) => {
    console.log('POST /add');

    // Retrieve values from the request body
    const commissionWorkshopId = 2//req.body.commissionWorkshopId; //!!!
    const userId = 2// req.body.userId; //!!!
    const status = 'Afwachtend'; // Hardcoded as the default status //!!!

    console.log(commissionWorkshopId, userId, status);

    try {
        const pool = await poolPromise;
        const query = 'INSERT INTO [CommissionWorkshopUser] (CommissionWorkshopId, UserId, Status) VALUES (@commissionWorkshopId, @userId, @status)'; //!!!

        console.log('EXECUTING QUERY ON DATABASE: ' + query);
        await pool.request() //!!!
            .input('commissionWorkshopId', sql.Int, commissionWorkshopId) //!!!
            .input('userId', sql.Int, userId) //!!!
            .input('status', sql.VarChar, status) //!!!
            .query(query);

        res.json({
            status: 200,
            message: 'Successfully added the commissionWorkshopId, userId, and status' //!!!
        });
    } catch (error) {
        console.error('Database Query Error: ', error);
        res.status(500).json({ error: 'Database Query Error' });
    }
});

// get all workshopcommisionusers
router.get('/all', async (req, res) => {
    console.log('GET /all');

    try {
        const pool = await poolPromise;
        const query = "SELECT * FROM [CommissionWorkshopUser]";
        console.log("EXECUTING QUERY ON DATABASE: " + query);
        const result = await pool.request().query(query);
        res.json({
          status: 200,
          data: result.recordset,
          message: "Succesfully retrieved everything",
        });
      } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ error: "Database Query Error" });
      }
    });

// voor de update om de status of afgewezen of geaccepteerd te maken
// 'UPDATE [WorkshopCommissionUser] SET Status = ${newStatus} WHERE UserId = ${userId} AND CommissionWorkshopId = ${commissionWorkshopId}'

module.exports = router;