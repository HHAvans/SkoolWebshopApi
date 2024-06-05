const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Route to validate a JWT token
router.get("/validate-token", (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Extract token from the Authorization header (e.g., "Bearer <token>")
  const tokenParts = token.split(" ");
  const tokenString = tokenParts[1];

  // Verify the token
  jwt.verify(tokenString, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Token is valid, return success response
    return res.status(200).json({ message: "Token is valid", decoded });
  });
});

module.exports = router;
