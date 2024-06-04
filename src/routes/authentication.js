const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../dao/sqldao.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

/** Login route
 *
 *  This route is used at the start of the website at the login. With an email and password
 *  it generates a JSON Web Token to access the rest of the website which is sent back to the website.
 *
 *  EXPECTED JSON BODY
 *
 * {
 *     "email": "example@mail.com",
 *     "password": "123"
 * }
 */
router.post("/login", async (req, res) => {
  console.log("POST /auth/login");

  const { email, password } = req.body;

  try {
    const pool = await poolPromise;
    console.log(
      `EXECUTING QUERY ON DATABASE: SELECT UserId, Username, Password FROM [User] WHERE Email = @Email`
    );
    const request = pool.request();
    request.input("Email", sql.VarChar, email);
    const result = await request.query(
      "SELECT UserId, Username, Password, Permission FROM [User] WHERE Email = @Email"
    );

    // If no users are found with that email
    if (result.recordset.length === 0) {
      console.log("POST /auth/login no user found");
      return res.status(401).json({
        status: 401,
        message: "Invalid credentials",
        data: {},
      });
    }

    const user = result.recordset[0];

    // Compare the provided password with the stored hashed password
    if (!bcrypt.compareSync(password, user.Password)) {
      // Invalid password
      console.log("POST /auth/login invalid password");
      return res.status(401).json({
        status: 401,
        message: "Invalid credentials",
        data: {},
      });
    } else {
      // Successful login
      console.log("POST /auth/login success");
      const token = jwt.sign(
        {
          id: user.UserId,
          username: user.Username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return res.status(200).json({
        status: 200,
        message: "Login successful",
        // Also give permissions to front-end to determine what to show
        data: { 
            userRole: user.Permission, 
            token },
      });
    }
  } catch (error) {
    console.error("Database query error:", error);
    return res.status(500).json({ error: "Database Query Error" });
  }
});

module.exports = router;
