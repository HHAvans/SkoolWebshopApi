const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../dao/sqldao.js");

/** Get all workshops in commissions where no users is added  to
 */
router.get("/all/nouser", async (req, res) => {
  console.log("GET /all/nouser");

  try {
    const pool = await poolPromise;
    const query = `
    SELECT 
      CommissionWorkshopId, CommissionId, StartTime, EndTime, NumberOfParticipants, Location, Level, 
      TargetGroup, WorkshopNotes, Workshop.WorkshopId, WorkshopName, Workshop.Category, Workshop.Requirements, 
      Workshop.Description, Workshop.LinkToPicture
    FROM CommissionWorkshop t1
    INNER JOIN Workshop ON t1.WorkshopId = Workshop.WorkshopId
    WHERE NOT EXISTS (SELECT t2.CommissionWorkshopId, t2.Status FROM CommissionWorkshopUser t2 WHERE t1.CommissionWorkshopId = t2.CommissionWorkshopId AND t2.Status = 'Toegewezen')`;
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


/** 
 * Get workshops in commissions and all associated data for front page ordered by data and time
 */
router.get("/all", async (req, res) => {
  console.log("GET /workshopcommission/all");

  try {
    const pool = await poolPromise;
    const query = `
    SELECT 
        CommissionWorkshopId, 
        WorkshopName, 
        CONVERT(VARCHAR(10), Date, 120) AS Date, 
        CONVERT(VARCHAR(8), StartTime, 108) AS StartTime, 
        CONVERT(VARCHAR(8), EndTime, 108) AS EndTime, 
        Requirements, 
        Category, 
        CommissionName, 
        Location, 
        LinkToPicture 
      FROM 
        CommissionWorkshop 
      INNER JOIN 
        Commission 
      ON 
        CommissionWorkshop.CommissionId = Commission.CommissionId 
      INNER JOIN 
        Workshop 
      ON 
        CommissionWorkshop.WorkshopId = Workshop.WorkshopId 
      ORDER BY 
        Date, StartTime
    `;
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

// krijg alle workshops waar de userid overeenkomt met header en is toegewezen
router.get("/:id", async (req, res) => {
  console.log("GET /:id");

  try {
    const pool = await poolPromise;
    const query = `
    SELECT 
    CommissionWorkshopId, 
    WorkshopName, 
    CONVERT(VARCHAR(10), Date, 120) AS Date, 
    CONVERT(VARCHAR(8), StartTime, 108) AS StartTime, 
    CONVERT(VARCHAR(8), EndTime, 108) AS EndTime, 
    Requirements, 
    Category, 
    CommissionName, 
    Location, 
    LinkToPicture 
FROM 
    CommissionWorkshop 
INNER JOIN 
    Commission 
ON 
    CommissionWorkshop.CommissionId = Commission.CommissionId 
INNER JOIN 
    Workshop 
ON 
    CommissionWorkshop.WorkshopId = Workshop.WorkshopId 
WHERE 
    CommissionWorkshop.userId = ${req.params.id};
ORDER BY 
    Date, 
    StartTime;
    `;
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


/**
 * Add a commission and its subsequent workshops into the database.
 * 
 * This is one of the more intensive route's with a varying amount of workshops added.
 * Expected JSON (2 workshops): {
 *  "commissionname": "",
 *  "clientname": "", (Must be existing client)
 *  "address": "",
 *  "date": "",
 *  "commissionnotes": "",
 *  "workshops": [
 *    {
 *      "workshopname": "", (Must be existing workshop)
 *      "maxusers": "",
 *      "numberofparticipents": "",
 *      "targetgroup": "",
 *      "level": "",
 *      "starttime": "",
 *      "endtime": "",
 *      "location": "",
 *      "workshopnotes": ""
 *    },
 *    {
 *      "workshopname": "",
 *      "maxusers": "",
 *      "numberofparticipents": "",
 *      "targetgroup": "",
 *      "level": "",
 *      "starttime": "",
 *      "endtime": "",
 *      "location": "",
 *      "workshopnotes": ""
 *    }
 *  ]
 * }
 */
router.post("/add", async (req, res) => {
  console.log("POST /workshopcommission/add");

  console.log('Body: \n' + req.body)

  try {
    const pool = await poolPromise;

    // Prepare the query to get client ID 
    const clientQuery = `
      DECLARE @ClientID INT;
      EXEC @ClientID = ClientIdByName @ClientName = @ClientName;
    `;
    console.log("EXECUTING QUERY ON DATABASE: " + clientQuery);

    // Execute the query to get client ID
    const clientResult = await pool.request()
      .input('ClientName', sql.NVarChar(100), req.body.clientname)
      .query(clientQuery);

    const clientId = clientResult.recordset[0].ClientId;

    // Insert into Commission table
    const insertCommissionQuery = `
      INSERT INTO Commission (ClientId, CommissionName, Address, Date, CommissionNotes) 
      VALUES (@ClientId, @CommissionName, @Address, @Date, @CommissionNotes);
      SELECT SCOPE_IDENTITY() AS CommissionId;
    `;
    console.log("EXECUTING QUERY ON DATABASE: " + insertCommissionQuery);

    // Execute the insert query for Commission and get the CommissionId
    const commissionResult = await pool.request()
      .input('ClientId', sql.Int, clientId)
      .input('CommissionName', sql.NVarChar(255), req.body.commissionname)
      .input('Address', sql.NVarChar(255), req.body.address)
      .input('Date', sql.DateTime, req.body.date)
      .input('CommissionNotes', sql.NVarChar(255), req.body.commissionnotes)
      .query(insertCommissionQuery);

    const commissionId = commissionResult.recordset[0].CommissionId;

    // Insert each workshop into Workshop table
    for (const workshop of req.body.workshops) {
      // Prepare the query to get workshop ID
      const workshopIdQuery = `
        DECLARE @WorkshopId INT;
        EXEC @WorkshopId = WorkshopIdByName @WorkshopName = @WorkshopName;
        SELECT @WorkshopId AS WorkshopId;
      `;
      console.log("EXECUTING QUERY ON DATABASE: " + workshopIdQuery);

      // Execute the query to get workshop ID
      const workshopIdResult = await pool.request()
        .input('WorkshopName', sql.NVarChar(100), workshop.workshopname)
        .query(workshopIdQuery);

      const workshopId = workshopIdResult.recordset[0].WorkshopId;

      const workshopQuery = `
        INSERT INTO CommissionWorkshop (CommissionId, WorkshopId, MaxUsers, NumberOfParticipants, TargetGroup, Level, StartTime, EndTime, Location, WorkshopNotes) 
        VALUES (@CommissionId, @WorkshopId, @MaxUsers, @NumberOfParticipants, @TargetGroup, @Level, @StartTime, @EndTime, @Location, @WorkshopNotes);
      `;
      console.log("EXECUTING QUERY ON DATABASE: " + workshopQuery);

      await pool.request()
        .input('CommissionId', sql.Int, commissionId)
        .input('WorkshopId', sql.Int, workshopId)
        .input('MaxUsers', sql.Int, workshop.maxusers)
        .input('NumberOfParticipants', sql.Int, workshop.numberofparticipents)
        .input('TargetGroup', sql.NVarChar(255), workshop.targetgroup)
        .input('Level', sql.NVarChar(255), workshop.level)
        .input('StartTime', sql.DateTime,`1970-01-01 ${workshop.starttime}`)
        .input('EndTime', sql.DateTime, `1970-01-01 ${workshop.endtime}`)
        .input('Location', sql.NVarChar(255), workshop.location)
        .input('WorkshopNotes', sql.NVarChar(255), workshop.workshopnotes)
        .query(workshopQuery);
    }

    res.status(200).json({ message: "Commission and workshops added successfully" });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Database Query Error" });
  }
});

module.exports = router;