// src/routes/workshopRead.js
const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../dao/sqldao.js");

/** add commission (with affiliated workshops)

EXPECTED JSON BODY
{
    "": 
}

*/

router.post('/add', async (req, res) => {
    console.log('POST /add');

    const body = req.body

    const commissionName = body.commissionName
    // etc ??  clientId == ?, de klant wordt geselecteerd, en heeft een id. krijg de id van de client wanneer geselecteerd
    // - name, address,date, notes

    try {
        const pool = await poolPromise;
        //VOEG DE QUERY TOE 
        querytodatabase = (`INSERT INTO [Commission]`)
        console.log('EXECUTING QUERY ON DATABSE: ' + querytodatabase)
        const result = await pool.request().query(querytodatabase)
        res.json({
            status: 200,
            message: "Succesfully added commission"
        });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Database Query Error'});
    }
});


/** Get all workshops in commissions where no users is added  to
 */
router.get("/all/nouser", async (req, res) => {
  console.log("GET /all/nouser");

  try {
    const pool = await poolPromise;
    const query = "SELECT  CommissionWorkshopId, CommissionId, StartTime, EndTime, NumberOfParticipants, Address, Level, TargetGroup, Notes, Workshop.WorkshopId, Workshop.Name, Workshop.Category, Workshop.Requirements, Workshop.Description, Workshop.LinkToPicture FROM CommissionWorkshop t1 INNER JOIN Workshop ON t1.WorkshopId = Workshop.WorkshopId WHERE NOT EXISTS (SELECT t2.CommissionWorkshopId, t2.Status FROM CommissionWorkshopUser t2 WHERE t1.CommissionWorkshopId = t2.CommissionWorkshopId AND t2.Status = 'Toegewezen')";
    console.log("EXECUTING QUERY ON DATABASE: " + query);
    const result = await pool.request().query(query);
    res.json({
      status: 200,
      message: "Succesfully retrieved all workshops in commissions with no user",
      data: result.recordset,
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Database Query Error" });
  }
});

module.exports = router;