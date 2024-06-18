const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../dao/sqldao.js");

/** Get users route
 * 
 *  This route gets all the info of the users EXCEPT passwords and id's.
 * 
 *  EXPECTED JSON BODY
 
{
    "clientname": "Example Name",
    "organisation": "Example BV",
    "targetaudience": "Example people",
    "email": "example@mail.nl",
    "phonenumber": "31600000000",
    "contactperson": "Example person",
    "address": "Example 1",
    "kvknumber": "1"
}

 */
router.get("/all", async (req, res) => {
  console.log("GET /user/all");

  try {
    const pool = await poolPromise;
    console.log("EXECUTING QUERY ON DATABASE: SELECT * FROM [User]");
    const result = await pool.request().query("SELECT * FROM [User]");

    // Remove IDs and passwords from the result set
    // const usersWithoutIdAndPassword = result.recordset.map(user => {
    //     const { UserId, Password, ...rest } = user;
    //     return rest;
    // });
    const users = result.recordset;

    res.json({
      status: 200,
      message: "User retrieved",
      data: users,
      // data: usersWithoutIdAndPassword
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Database Query Error" });
  }
});

// fetching username, email, role and id.

router.get("/basic", async (req, res) => {
  console.log("GET /user/basic");

  try {
    const pool = await poolPromise;
    const status = "Afwachtend";
    console.log(
      "EXECUTING QUERY ON DATABASE: SELECT Username, Email, Role, UserId FROM [User] WHERE Status = @status"
    );

    const result = await pool
      .request()
      .input("status", status)
      .query(
        "SELECT Username, Email, Role, UserId FROM [User] WHERE Status = @status"
      );

    if (result.recordset.length > 0) {
      res.status(200).json({
        status: 200,
        message: "User data retrieved successfully",
        data: result.recordset,
      });
    } else {
      res.status(200).json({
        status: 200,
        message: "No users found with the given status",
        data: {},
      });
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({
      status: 500,
      message: "Database Query Error",
      data: {},
    });
  }
});

//updating status in users

router.post("/updateStatus", async (req, res) => {
  console.log("POST /user/updateStatus");
  console.log("Request body:", req.body);

  try {
    const { Username, status } = req.body;
    if (!Username || !status) {
      return res
        .status(400)
        .json({ status: 400, message: "Username and status are required" });
    }

    const trimmedUsername = Username.trim();
    console.log(`Updating user ${trimmedUsername} to status ${status}`);

    const pool = await poolPromise;
    console.log(
      "Executing query on database: UPDATE [User] SET Status = @status WHERE Username = @username"
    );

    const result = await pool
      .request()
      .input("status", status)
      .input("username", trimmedUsername) // Trim any extra spaces
      .query("UPDATE [User] SET Status = @status WHERE Username = @username");

    console.log("Query result:", result);

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({
        status: 200,
        message: "User status updated successfully",
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Database Query Error" });
  }
});

//Delete user

router.delete("/delete", async (req, res) => {
  console.log("DELETE /user/delete");
  console.log("Request body:", req.body);

  try {
    const { Username } = req.body; // Expect 'Username' in the request body
    if (!Username) {
      return res
        .status(400)
        .json({ status: 400, message: "Username is required" });
    }

    const pool = await poolPromise;
    console.log(
      "Executing query on database: DELETE FROM [User] WHERE Username = @username"
    );

    const result = await pool
      .request()
      .input("username", Username.trim()) // Trim any extra spaces
      .query("DELETE FROM [User] WHERE Username = @username");

    console.log("Query result:", result);

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({
        status: 200,
        message: "User deleted successfully",
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Database Query Error" });
  }
});

// Get specific user
router.get("/:id", async (req, res) => {
  console.log("GET /user/:id");

  try {
    const pool = await poolPromise;
    console.log(
      "EXECUTING QUERY ON DATABASE: SELECT * FROM [User] WHERE UserId = " +
        req.params.id
    );
    const result = await pool
      .request()
      .query("SELECT * FROM [User] WHERE UserId = " + req.params.id);

    // Remove IDs and passwords from the result set and format birthdate and boolean fields
    const userWithoutIdAndPassword = result.recordset.map((user) => {
      const { UserId, Password, Birthdate, HasCar, HasLicense, ...rest } = user;

      // Convert Birthdate to string in 'YYYY-MM-DD' format
      const formattedBirthdate =
        Birthdate instanceof Date
          ? Birthdate.toISOString().split("T")[0]
          : Birthdate;

      return {
        ...rest,
        Birthdate: formattedBirthdate, // Format Birthdate
        HasCar: HasCar ? "Ja" : "Nee", // Format HasCar
        HasLicense: HasLicense ? "Ja" : "Nee", // Format HasLicense
      };
    });

    res.json({
      status: 200,
      message: "User retrieved",
      data: userWithoutIdAndPassword,
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Database Query Error" });
  }
});

//update user information
router.post("/add", async (req, res) => {
  console.log("POST /user/add");
  console.log("Request body:", req.body);

  const {
    Username,
    Email,
    Role,
    Birthdate,
    Password,
    PhoneNumber,
    Address,
    PostalCode,
    Country,
    Language,
    BTWNumber,
    KVKNumber,
    BankId,
    UsesPublicTransit,
    HasCar,
    HasLicense,
    Status,
  } = req.body;

  if (!Username || !Email || !Password) {
    return res.status(400).json({
      status: 400,
      message: "Username, Email and Password are required",
    });
  }

  try {
    const pool = await poolPromise;
    const query = `
      INSERT INTO [User] (
        Username, Email, Password, Birthdate, Role, PhoneNumber, Address, PostalCode,
        Country, Language, BTWNumber, KVKNumber, BankId
      )
      VALUES (
        @Username, @Email, @Password, @Birthdate, @Role, @PhoneNumber, @Address, @PostalCode,
        @Country, @Language, @BTWNumber, @KVKNumber, @BankId
      )
    `;

    const result = await pool
      .request()
      .input("Username", sql.VarChar, Username)
      .input("Email", sql.VarChar, Email)
      .input("Password", sql.VarChar, Password)
      .input("Birthdate", sql.Date, Birthdate)
      .input("Role", sql.VarChar, Role)
      .input("PhoneNumber", sql.VarChar, PhoneNumber)
      .input("Address", sql.VarChar, Address)
      .input("PostalCode", sql.VarChar, PostalCode)
      .input("Country", sql.VarChar, Country)
      .input("Language", sql.VarChar, Language)
      .input("BTWNumber", sql.VarChar, BTWNumber)
      .input("KVKNumber", sql.VarChar, KVKNumber)
      .input("BankId", sql.VarChar, BankId)
      .query(query);

    console.log("User added:", result);

    res.status(201).json({
      status: 201,
      message: "User added successfully",
      data: {
        Username,
        Email,
        Role,
        Birthdate,
        PhoneNumber,
        Address,
        PostalCode,
        Country,
        Language,
        BTWNumber,
        KVKNumber,
        BankId,
      },
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ status: 500, message: "Database Query Error" });
  }
});

module.exports = router;
