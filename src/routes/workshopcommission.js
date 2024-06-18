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
    const query = `EXEC WorkshopCommissionsWithUserAssigned @UserId = ${req.params.id}`;
    console.log("EXECUTING QUERY ON DATABASE: " + query);
    const result = await pool.request().query(query);
    res.json({
      status: 200,
      message: "Succesfully retrieved workshops in commissions and all associated data where an user is assigned to",
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
 *  "amountofrounds": 1,
 *  "starttimeday": "9:00",
 *  "endtimeday": "15:00",
 *  "workshops": [
 *    {
 *      "workshopname": "", (Must be existing workshop)
 *      "maxusers": "",
 *      "numberofparticipents": "",
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
      INSERT INTO Commission (ClientId, CommissionName, Address, Date, CommissionNotes, AmountOfRounds, StartTimeDay, EndTimeDay) 
      VALUES (@ClientId, @CommissionName, @Address, @Date, @CommissionNotes, @AmountOfRounds, @StartTimeDay, @EndTimeDay);
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
      .input('AmountOfRounds', sql.Int, req.body.amountofrounds)
      .input('StartTimeDay', sql.DateTime, `1970-01-01 ${req.body.starttimeday}`)
      .input('EndTimeDay', sql.DateTime, `1970-01-01 ${req.body.endtimeday}`)
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
        INSERT INTO CommissionWorkshop (CommissionId, WorkshopId, MaxUsers, NumberOfParticipants, Level, StartTime, EndTime, Location, WorkshopNotes)
        VALUES (@CommissionId, @WorkshopId, @MaxUsers, @NumberOfParticipants, @Level, @StartTime, @EndTime, @Location, @WorkshopNotes);
      `;
      console.log("EXECUTING QUERY ON DATABASE: " + workshopQuery);

      await pool.request()
        .input('CommissionId', sql.Int, commissionId)
        .input('WorkshopId', sql.Int, workshopId)
        .input('MaxUsers', sql.Int, workshop.maxusers)
        .input('NumberOfParticipants', sql.Int, workshop.numberofparticipants)
        .input('Level', sql.NVarChar(255), workshop.level)
        .input('StartTime', sql.DateTime, `1970-01-01 ${workshop.starttime}`)
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

// Get workshops in commissions where status = afwachtend

router.get("/status/unassigned", async (req, res) => {
  console.log("GET /workshopcommission/status/unassigned");

  try {
    const pool = await poolPromise;
    const query = `
    SELECT 
    CommissionWorkshop.CommissionWorkshopId,
    CommissionWorkshopUser.UserId,
    Workshop.WorkshopName,
    Workshop.Category,
    Client.ClientName,
    CommissionWorkshop.Location,
    [User].Username
FROM 
    CommissionWorkshopUser
INNER JOIN 
    CommissionWorkshop ON CommissionWorkshopUser.CommissionWorkshopId = CommissionWorkshop.CommissionWorkshopId
INNER JOIN 
    Workshop ON CommissionWorkshop.WorkshopId = Workshop.WorkshopId
INNER JOIN 
    Client ON CommissionWorkshop.CommissionId = Client.ClientId
LEFT JOIN 
    [User] ON CommissionWorkshopUser.UserId = [User].UserId
WHERE 
    CommissionWorkshopUser.Status = 'Afwachtend'
    `;

    console.log("EXECUTING QUERY ON DATABASE: " + query);
    const result = await pool.request().query(query);
    res.json({
      status: 200,
      message: "Successfully retrieved all basic workshop information in commissions with no user",
      data: result.recordset,
    });
  } catch (error) {
    console.error("Database query error:", error);
    console.error("Error details:", error.message, error.stack);
    res.status(500).json({ error: "Database Query Error", details: error.message });
  }
});

module.exports = router;