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
router.put("/:id", async (req, res) => {
  console.log("PUT /user/:id");

  const userId = req.params.id;
  const {
    username,
    email,
    phoneNumber,
    address,
    postalCode,
    country,
    language,
    BTWNumber,
    KVKNumber,
    bankId,
    role,
    usesPublicTransit,
    hasCar,
    hasLicense,
    status
  } = req.body;

  let updates = [];
  if (username) updates.push(`Username = @Username`);
  if (email) updates.push(`Email = @Email`);
  if (phoneNumber) updates.push(`PhoneNumber = @PhoneNumber`);
  if (address) updates.push(`Address = @Address`);
  if (postalCode) updates.push(`PostalCode = @PostalCode`);
  if (country) updates.push(`Country = @Country`);
  if (language) updates.push(`Language = @Language`);
  if (BTWNumber) updates.push(`BTWNumber = @BTWNumber`);
  if (KVKNumber) updates.push(`KVKNumber = @KVKNumber`);
  if (bankId) updates.push(`BankId = @BankId`);
  if (role) updates.push(`Role = @Role`);
  if (usesPublicTransit !== undefined) updates.push(`UsesPublicTransit = @UsesPublicTransit`);
  if (hasCar !== undefined) updates.push(`HasCar = @HasCar`);
  if (hasLicense !== undefined) updates.push(`HasLicense = @HasLicense`);
  if (status) updates.push(`Status = @Status`);

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  const query = `
    UPDATE "User"
    SET ${updates.join(', ')}
    WHERE UserId = @UserId
  `;

  console.log("Executing query:", query);

  try {
    const pool = await poolPromise;
    const request = pool.request();
    
    // Adding inputs for each field to be updated
    request.input('UserId', sql.Int, userId);
    if (username) request.input('Username', sql.NVarChar, username);
    if (email) request.input('Email', sql.NVarChar, email);
    if (phoneNumber) request.input('PhoneNumber', sql.NVarChar, phoneNumber);
    if (address) request.input('Address', sql.NVarChar, address);
    if (postalCode) request.input('PostalCode', sql.NVarChar, postalCode);
    if (country) request.input('Country', sql.NVarChar, country);
    if (language) request.input('Language', sql.NVarChar, language);
    if (BTWNumber) request.input('BTWNumber', sql.Int, BTWNumber);
    if (KVKNumber) request.input('KVKNumber', sql.Int, KVKNumber);
    if (bankId) request.input('BankId', sql.NVarChar, bankId);
    if (role) request.input('Role', sql.NVarChar, role);
    if (usesPublicTransit !== undefined) request.input('UsesPublicTransit', sql.Bit, usesPublicTransit);
    if (hasCar !== undefined) request.input('HasCar', sql.Bit, hasCar);
    if (hasLicense !== undefined) request.input('HasLicense', sql.Bit, hasLicense);
    if (status) request.input('Status', sql.NVarChar, status);

    const result = await request.query(query);

    res.json({
      status: 200,
      message: "User updated",
      data: result.rowsAffected
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Database Query Error" });
  }
});

//Add user
router.post("/add", async (req, res) => {
  console.log("POST /user/add");
  console.log("Request body:", req.body);

  const {
    Username,
    Birthdate,
    City,
    Address,
    Email,
    Password,
    PhoneNumber,
    PostalCode,
    Country,
    Language,
    BTWNumber,
    KVKNumber,
    BankId,
    Role,
    SalaryPerHourInEuro,
    UsesPublicTransit,
    HasCar,
    HasLicense,
    Status,
  } = req.body;

  // Validate required fields
  if (
    !Username ||
    !Birthdate ||
    !City ||
    !Address ||
    !Email ||
    !Password ||
    !PhoneNumber ||
    !PostalCode ||
    !Country ||
    !Language ||
    !BankId ||
    !Role
  ) {
    return res.status(400).json({
      status: 400,
      message: "Required fields are missing",
    });
  }

  // Additional validation for ZZP role
  if (Role === "ZZP" && (!BTWNumber || !KVKNumber)) {
    return res.status(400).json({
      status: 400,
      message: "BTWNumber and KVKNumber are required for ZZP role",
    });
  }

  try {
    const pool = await poolPromise;
    const query = `
      INSERT INTO "User" (
        Username, Birthdate, City, Address, Email, Password, PhoneNumber, PostalCode,
        Country, Language, BTWNumber, KVKNumber, BankId, Role, Permission, SalaryPerHourInEuro,
        UsesPublicTransit, HasCar, HasLicense, Status
      )
      VALUES (
        @Username, @Birthdate, @City, @Address, @Email, @Password, @PhoneNumber, @PostalCode,
        @Country, @Language, @BTWNumber, @KVKNumber, @BankId, @Role, 'Default', @SalaryPerHourInEuro,
        @UsesPublicTransit, @HasCar, @HasLicense, @Status
      )
    `;

    const result = await pool
      .request()
      .input("Username", sql.NVarChar, Username)
      .input("Birthdate", sql.Date, Birthdate)
      .input("City", sql.NVarChar, City)
      .input("Address", sql.NVarChar, Address)
      .input("Email", sql.NVarChar, Email)
      .input("Password", sql.NVarChar, Password)
      .input("PhoneNumber", sql.NVarChar, PhoneNumber)
      .input("PostalCode", sql.NVarChar, PostalCode)
      .input("Country", sql.NVarChar, Country)
      .input("Language", sql.NVarChar, Language)
      .input("BTWNumber", sql.Int, BTWNumber)
      .input("KVKNumber", sql.Int, KVKNumber)
      .input("BankId", sql.NVarChar, BankId)
      .input("Role", sql.NVarChar, Role)
      .input("SalaryPerHourInEuro", sql.Decimal, SalaryPerHourInEuro)
      .input("UsesPublicTransit", sql.Bit, UsesPublicTransit)
      .input("HasCar", sql.Bit, HasCar)
      .input("HasLicense", sql.Bit, HasLicense)
      .input("Status", sql.NVarChar, Status)
      .query(query);

    console.log("User added:", result);

    res.status(201).json({
      status: 201,
      message: "User added successfully",
      data: {
        Username,
        Birthdate,
        City,
        Address,
        Email,
        PhoneNumber,
        PostalCode,
        Country,
        Language,
        BTWNumber,
        KVKNumber,
        BankId,
        Role,
        SalaryPerHourInEuro,
        UsesPublicTransit,
        HasCar,
        HasLicense,
        Status,
      },
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ status: 500, message: "Database Query Error" });
  }
});

module.exports = router;
