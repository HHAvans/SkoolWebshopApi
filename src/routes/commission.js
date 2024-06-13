// src/routes/workshopRead.js
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
    CommissionWorkshop.CommissionWorkshopId, 
    Workshop.WorkshopName, 
    CONVERT(VARCHAR(10), Commission.Date, 120) AS Date, 
    CONVERT(VARCHAR(8), CommissionWorkshop.StartTime, 108) AS StartTime, 
    CONVERT(VARCHAR(8), CommissionWorkshop.EndTime, 108) AS EndTime, 
    Workshop.Requirements, 
    Workshop.Category, 
    Commission.CommissionName, 
    CommissionWorkshop.Location, 
    Workshop.LinkToPicture 
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
    NOT EXISTS (
        SELECT 1 
        FROM CommissionWorkshopUser t2 
        WHERE 
            CommissionWorkshop.CommissionWorkshopId = t2.CommissionWorkshopId 
            AND t2.Status = 'Toegewezen'
    )
ORDER BY 
    Commission.Date, CommissionWorkshop.StartTime;

    `;
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

/** Get all commissions route
 *
 *  Retrieves all commissions from the database
 */
router.get("/all", async (req, res) => {
  console.log("GET /all");

  try {
    const pool = await poolPromise;
    const query = `
      SELECT 
        C.CommissionId,
        C.ClientId,
        C.CommissionName,
        C.Address,
        C.Date,
        C.CommissionNotes,
        W.WorkshopId,
        W.WorkshopName,
        CASE 
          WHEN CWU.Status = 'Toegewezen' THEN U.Username
          ELSE NULL
        END AS TeacherName --case om toegewezen teacher te tonen
      FROM Commission C
      LEFT JOIN CommissionWorkshop CW ON C.CommissionId = CW.CommissionId
      LEFT JOIN Workshop W ON CW.WorkshopId = W.WorkshopId
      LEFT JOIN CommissionWorkshopUser CWU ON CW.CommissionWorkshopId = CWU.CommissionWorkshopId
      LEFT JOIN [User] U ON CWU.UserId = U.UserId
      ORDER BY C.CommissionId
    `;

    console.log("EXECUTING QUERY ON DATABASE: " + query);
    const result = await pool.request().query(query);
    const commissions = [];
    result.recordset.forEach(row => {
      if(!commissions[row.CommissionId]) {
        commissions[row.CommissionId] = {
          CommissionId: row.CommissionId,
          ClientId: row.ClientId,
          CommissionName: row.CommissionName,
          Address: row.Address,
          Date: row.Date,
          CommissionNotes: row.CommissionNotes,
          Workshops: []
        };
      }
      commissions[row.CommissionId].Workshops.push({
        workshopId: row.WorkshopId,
        workshopName: row.WorkshopName,
        assignedTeacher: row.TeacherName
      })
    })
    res.json({
      status: 200,
      data: Object.values(commissions),
      message: "Succesfully retrieved all commissions",
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Database Query Error" });
  }
});

/** Get workshops in commission route 
 *
 *  Retrieves all workshops in a commission from the database
 */
router.get("/:id", async (req, res) => {
  console.log("GET /:id");

  try {
    const pool = await poolPromise;
    const query = `
    SELECT 
    CL.ClientName, 
    C.CommissionName AS CommissionName, C.Address AS CommissionAddress, C.CommissionNotes AS CommissionNotes,
    W.WorkshopName AS WorkshopName, W.Description AS WorkshopDescription, W.Category AS WorkshopCategory, 
    W.LinkToPicture AS WorkshopLinkToPicture, W.Requirements AS WorkshopRequirements,
    CW.StartTime, CW.EndTime, CW.Location AS WorkshopAddress, CW.Level, CW.WorkshopNotes AS WorkshopNotes, 
    CW.NumberOfParticipants, CW.WorkshopId, CW.CommissionWorkshopId,
    CWU.UserId,
    U.Username, U.Email, U.SalaryPerHourInEuro
      FROM CommissionWorkshop CW
      JOIN Commission C ON C.CommissionId = CW.CommissionId
      LEFT JOIN CommissionWorkshopUser CWU ON CWU.CommissionWorkshopId = CW.CommissionWorkshopId
      AND CWU.Status = 'Toegewezen'
      LEFT JOIN [User] U ON U.UserId = CWU.UserId
      JOIN Workshop W ON W.WorkshopId = CW.WorkshopId
      JOIN Client CL ON CL.ClientId = C.ClientId
      WHERE CW.CommissionId = ${req.params.id} AND (CWU.UserId IS NULL OR CWU.Status = 'Toegewezen');
    `;
    

    console.log("EXECUTING QUERY ON DATABASE: " + query);
    const result = await pool.request().query(query);

    //structuur van de response
    let response = {
      ClientName: null,
      CommissionName: null,
      CommissionAddress: null,
      CommissionNotes: null,
      Workshops: []
    };
    result.recordset.forEach(row => {
      if (!response.ClientName) {
        response.ClientName = row.ClientName;
        response.CommissionName = row.CommissionName;
        response.CommissionAddress = row.CommissionAddress;
        response.CommissionNotes = row.CommissionNotes;
      }

      let workshop = response.Workshops.find(ws => ws.WorkshopId === row.WorkshopId);
      if (!workshop) {
        workshop = {
          WorkshopName: row.WorkshopName,
          WorkshopDescription: row.WorkshopDescription,
          WorkshopCategory: row.WorkshopCategory,
          WorkshopLinkToPicture: row.WorkshopLinkToPicture,
          WorkshopRequirements: row.WorkshopRequirements ? row.WorkshopRequirements.split(',').map(req => req.trim()) : [], // Split and trim requirements
          StartTime: row.StartTime,
          EndTime: row.EndTime,
          WorkshopAddress: row.WorkshopAddress,
          Level: row.Level,
          WorkshopNotes: row.WorkshopNotes,
          NumberOfParticipants: row.NumberOfParticipants,
          WorkshopId: row.WorkshopId,
          CommissionWorkshopId: row.CommissionWorkshopId,
          Users: []
        };
        response.Workshops.push(workshop);
      }

      if (row.UserId) {
        workshop.Users.push({
          UserId: row.UserId,
          Username: row.Username,
          Email: row.Email,
          SalaryPerHourInEuro: row.SalaryPerHourInEuro
        });
      }
    });

    res.json({
      status: 200,
      data: response,
      message: "Successfully retrieved commission"
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Database Query Error" });
  }
});


/** add commission (with affiliated workshops)

EXPECTED JSON BODY
{
    "": 
}

*/

router.post('/add', async (req, res) => {
  console.log('POST /add');

  const body = req.body

  //commission itself
  const commissionName = body.commissionName
  const client = body.client
  const address = body.address
  const date = body.date
  const notes = body.notes
  
  //workshop in commission
  const workshop = body.workshop
  const teachersNeeded = body.teachersNeeded
  const participants = body.participants
  const grade = body.grade
  const level = body.level
  const startTime = body.startTime
  const endTime = body.endTime
  const location = body.location
  const workshopNotes = body.workshopNotes


  try {
      const pool = await poolPromise;
      
      //Queries
      querytodbcomm = (`INSERT INTO [Commission] VALUES ('${client}', '${commissionName}', '${address}', '${date}', '${notes}')`)
      querytodbcommworkshop = (`INSERT INTO [CommissionWorkshop] VALUES ('${workshop}', '${startTime}', '${endTime}', '${teachersNeeded}', '${participants}', '${location}', '${level}', '${grade}', '${workshopNotes}')`)
      console.log('EXECUTING QUERIES ON DATABSE: ' + querytodbcomm + ', ' + querytodbcommworkshop)
      
      await Promise.all([
          pool.request().query(querytodbcomm),
          pool.request().query(querytodbcommworkshop)
      ]);
      
      res.json({
          status: 200,
          message: "Succesfully added commission"
      });
  } catch (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Database Query Error'});
  }
});



module.exports = router;