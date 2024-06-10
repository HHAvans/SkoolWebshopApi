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
    "description": "Workshop graffiti",
    "linktopictrure": "https://upload.wikimedia.org/wikipedia/commons/8/8d/President_Barack_Obama.jpg"
}

 */
router.post('/add', async (req, res) => {
    console.log('POST /add');

    const body = req.body

    const name = body.name
    const category = body.category
    const requirements = body.requirements
    const description = body.description
    const linktopicture = body.linktopicture

    try {
        const pool = await poolPromise;
        querytodatabase = (`INSERT INTO [Workshop] VALUES ('${name}', '${category}', '${requirements}', '${description}', '${linktopicture}')`)
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

  /** Get all workshops route
 *
 *  Retrieves all workshops names from the database.
 *  Used for the dropdown of the add commissions front-end
 */
router.get("/allnames", async (req, res) => {
  console.log("GET /allnames");

  try {
    const pool = await poolPromise;
    const query = "SELECT WorkshopName FROM [Workshop]";
    console.log("EXECUTING QUERY ON DATABASE: " + query);
    const result = await pool.request().query(query);
    res.json({
      status: 200,
      data: result.recordset,
      message: "Succesfully retrieved all workshop names",
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Database Query Error" });
  }
});

module.exports = router;
