const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../dao/sqldao');

// user signs up for a workshop in an assignment
// the status gets changed to pending - "Afwachtend"
router.post('/add', async (req, res) => {
    console.log('POST /add');

    const body = req.body

    const CommissionWorkshopId = body.CommissionWorkshopId
    const userId = body.userId
    const status = body.signup

    try {
        const pool = await poolPromise;
        query = (`INSERT INTO [WorkshopCommissionUser] VALUES ('${CommissionWorkshopId}', '${userId}', '${status}')`)
        console.log('EXECUTING QUERY ON DATABASE: ' + query);
        const result = await pool.request.query(query);
        res.json({
            status: 200,
            message: 'Succesfully added the workshopid, userid and status'
        });
        
    } catch (error) {
        console.error('Database Query Error: ', error);
        res.status(500).json({ error: 'Database Query Error'});
    }
})

// voor de update om de status of afgewezen of geaccepteerd te maken
// 'UPDATE [WorkshopCommissionUser] SET Status = ${newStatus} WHERE UserId = ${userId} AND CommissionWorkshopId = ${commissionWorkshopId}'

module.exports = router;