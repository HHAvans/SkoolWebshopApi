const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../dao/sqldao.js");

/** 
 * Get workshops in commissions and all associated data for front page ordered by data and time
 */
router.get("/all", async (req, res) => {
  console.log("GET /workshopcommission/all");

  try {
    const pool = await poolPromise;
    const query = "SELECT CommissionWorkshopId, WorkshopName, Date, StartTime, EndTime, Requirements, Category, CommissionName, Location, LinkToPicture FROM CommissionWorkshop INNER JOIN Commission ON CommissionWorkshop.CommissionId = Commission.CommissionId INNER JOIN Workshop ON CommissionWorkshop.WorkshopId = Workshop.WorkshopId ORDER BY Date, StartTime";
    console.log("EXECUTING QUERY ON DATABASE: " + query);
    const result = await pool.request().query(query);
    res.json({
      status: 200,
      message: "Succesfully retrieved workshops in commissions and all associated data",
      data: result.recordset,
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Database Query Error" });
  }
});

module.exports = router;