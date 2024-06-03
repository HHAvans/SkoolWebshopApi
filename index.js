const express = require("express");
const { sql, poolPromise } = require("./src/dao/sqldao.js");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000; // Port corrected to 3000 for standard practice

// Main routes
const userRoutes = require("./src/routes/user.js");
const workshopRoutes = require("./src/routes/workshop.js");
const authenticationRoutes = require("./src/routes/authentication.js");
const customerRoutes = require("./src/routes/client.js");
const commissionRoutes = require("./src/routes/commission.js");

app.use("/user", userRoutes);
app.use("/workshop", workshopRoutes);
app.use("/auth", authenticationRoutes);
app.use("/client", customerRoutes);
app.use("/commission", commissionRoutes);
app.use("/commission/:id", commissionRoutes);

// Route error handler
app.use((req, res, next) => {
  next({
    status: 404,
    message: "Route not found",
    data: {},
  });
});

// Express error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    status: error.status || 500,
    message: error.message || "Internal Server Error",
    data: {},
  });
});

// Host 0.0.0.0 to allow remote connections
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
