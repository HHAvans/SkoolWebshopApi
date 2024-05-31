// src/routes/workshopRead.js
const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../dao/sqldao.js");

/** Get all workshops route
 *
 *  Retrieves all workshops from the database
 */
router.get("/all", async (req, res) => {
  console.log("GET /all");

  try {
    const pool = await poolPromise;
    const query = "SELECT * FROM [Workshop]";
    console.log("EXECUTING QUERY ON DATABASE: " + query);
    const result = await pool.request().query(query);
    res.json({
      status: 200,
      data: result.recordset,
      message: "Succesfully retrieved all workshops",
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Database Query Error" });
  }
});

module.exports = router;
