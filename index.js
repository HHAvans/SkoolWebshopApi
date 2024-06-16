const express = require("express");

const cors = require("cors");
const app = express();
const path = require("path");

require('./src/services/scheduler'); 


const corsOptions = {
  origin: "*", // Allows all origins
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allows all HTTP methods
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(express.json());

const port = process.env.PORT || 3000; // Port corrected to 3000 for standard practice

// Main routes
const userRoutes = require("./src/routes/user.js");
const workshopRoutes = require("./src/routes/workshop.js");
const authenticationRoutes = require("./src/routes/authentication.js");
const customerRoutes = require("./src/routes/client.js");
const commissionRoutes = require("./src/routes/commission.js");
const emailRoutes = require("./src/routes/email.js");
const workshopCommissionRoutes = require("./src/routes/workshopcommission.js");
const optionsRoutes = require("./src/routes/options.js");
const validateTokenRoutes = require("./src/routes/validateToken.js");
const workshopCommissionUserRoutes = require("./src/routes/workshopcommissionuser.js");

app.use("/user", userRoutes);
app.use("/auth", validateTokenRoutes);
app.use("/workshop", workshopRoutes);
app.use("/auth", authenticationRoutes);
app.use("/client", customerRoutes);
app.use("/commission", commissionRoutes);
app.use("/commission/:id", commissionRoutes);
app.use("/email", emailRoutes);
app.use("/workshopcommission", workshopCommissionRoutes);
app.use("/options", optionsRoutes);
app.use("/workshopcommissionuser", workshopCommissionUserRoutes);

// Serve the html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "addCommission.html"));
});

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

// Helper function to replace placeholders in text with actual data
function replacePlaceholders(textWithPlaceholders, userData) {
  // Replace placeholders with actual data
  let text = textWithPlaceholders.replace("{name}", userData.name);
  text = text.replace("{email}", userData.email);
  // Add more replacements as needed
  return text;
}
