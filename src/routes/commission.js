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

/** Get all commissions route
 *
 *  Retrieves all commissions from the database
 */
router.get("/all", async (req, res) => {
  console.log("GET /all");

  try {
    const pool = await poolPromise;
    const query = "SELECT * FROM [Commission]";
    console.log("EXECUTING QUERY ON DATABASE: " + query);
    const result = await pool.request().query(query);
    res.json({
      status: 200,
      data: result.recordset,
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
        C.Name AS CommissionName, C.Address AS CommissionAddress, C.Notes AS CommissionNotes,
        W.Name AS WorkshopName, W.Description AS WorkshopDescription, W.Category AS WorkshopCategory, 
        W.LinkToPicture AS WorkshopLinkToPicture, W.Requirements AS WorkshopRequirements,
        CW.StartTime, CW.EndTime, CW.Address AS WorkshopAddress, CW.TargetGroup, CW.Level, CW.Notes AS WorkshopNotes, 
        CW.NumberOfParticipants, CW.WorkshopId, CW.CommissionWorkshopId,
        CWU.UserId,
        U.Username, U.Email
      FROM CommissionWorkshop CW
      JOIN Commission C ON C.CommissionId = CW.CommissionId
      LEFT JOIN CommissionWorkshopUser CWU ON CWU.CommissionWorkshopId = CW.CommissionWorkshopId
      LEFT JOIN [User] U ON U.UserId = CWU.UserId
      JOIN Workshop W ON W.WorkshopId = CW.WorkshopId
      JOIN Client CL ON CL.ClientId = C.ClientId
      WHERE CW.CommissionId = ${req.params.id};
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
          TargetGroup: row.TargetGroup,
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
          Email: row.Email
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




module.exports = router;