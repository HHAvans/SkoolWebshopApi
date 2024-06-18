const cron = require("node-cron");
const { sql, poolPromise } = require("../dao/sqldao"); // Adjust the path as necessary
const { sendEmail, wrapInHtml } = require("./emailService");

// Function to replace placeholders in the template with actual data
function replacePlaceholders(template, data) {
  let text = template;
  for (const key in data) {
    const placeholder = `{${key}}`;
    console.log(`Replacing ${placeholder} with ${data[key]}`); // Debug logging
    text = text.replace(new RegExp(placeholder, "g"), data[key] || ""); // Replace with empty string if data is missing
  }
  return text;
}

// Function to send reminder emails for workshops starting in the next 24 hours
async function sendWorkshopReminders() {
  try {
    const pool = await poolPromise;

    // Debugging: Print out the current date and the calculated date range
    const now = await pool
      .request()
      .query(
        "SELECT GETDATE() AS CurrentDateTime, DATEADD(HOUR, 24, GETDATE()) AS EndDateTime"
      );
    console.log("Current DateTime and End DateTime:", now.recordset);

    // Query to find workshops starting in the next 24 hours
    const workshopQuery = `
            SELECT 
                u.Username,
                u.Email,
                cw.StartTime,
                cw.EndTime,
                cw.Location,
                w.WorkshopName,
                c.Date AS WorkshopDate,
                CAST(CONCAT(CONVERT(VARCHAR(10), c.Date, 120), ' ', CONVERT(VARCHAR(8), cw.StartTime, 108)) AS DATETIME) AS CalculatedStartTime
            FROM 
                [User] u
            JOIN 
                CommissionWorkshopUser cwu ON u.UserId = cwu.UserId
            JOIN 
                CommissionWorkshop cw ON cwu.CommissionWorkshopId = cw.CommissionWorkshopId
            JOIN 
                Commission c ON cw.CommissionId = c.CommissionId
            JOIN 
                Workshop w ON cw.WorkshopId = w.WorkshopId
            WHERE 
                CAST(CONCAT(CONVERT(VARCHAR(10), c.Date, 120), ' ', CONVERT(VARCHAR(8), cw.StartTime, 108)) AS DATETIME) 
                BETWEEN DATEADD(HOUR, 24, GETDATE()) AND DATEADD(HOUR, 48, GETDATE());
        `;

    const workshopResult = await pool.request().query(workshopQuery);
    console.log("Workshop Query Result:", workshopResult);

    // Debugging: Print the calculated start times
    for (const record of workshopResult.recordset) {
      console.log("Calculated StartTime:", record.CalculatedStartTime);
    }

    if (workshopResult.recordset.length > 0) {
      // Query to fetch the email template
      const templateQuery =
        "SELECT CONTENT FROM [EmailTemplate] WHERE Name = @templateName";
      const templateName = "WorkshopReminder"; // Adjust this as needed

      const templateResult = await pool
        .request()
        .input("templateName", sql.NVarChar, templateName)
        .query(templateQuery);

      if (templateResult.recordset.length === 0) {
        console.error("Email template not found");
        return;
      }

      const templateContent = templateResult.recordset[0].CONTENT;

      for (const userData of workshopResult.recordset) {
        // Replace placeholders in the template
        const emailText = replacePlaceholders(templateContent, {
          Username: userData.Username,
          WorkshopName: userData.WorkshopName,
          StartTime: userData.StartTime,
          EndTime: userData.EndTime,
          Location: userData.Location,
        });

        // Wrap in HTML
        const emailHtml = wrapInHtml(emailText);

        // Send email
        console.log(`Sending email to ${userData.Email}`);
        await sendEmail(userData.Email, "Workshop Reminder", emailHtml);
      }
      console.log("Reminder emails sent successfully!");
    } else {
      console.log("No workshops starting in the next 24 hours.");
    }
  } catch (error) {
    console.error("Error sending reminder emails:", error);
  }
}

// Schedule the job to run once a day at midnight
cron.schedule("0 0 * * *", () => {
  console.log("Running workshop reminder job once a day at midnight");
  sendWorkshopReminders();
});
