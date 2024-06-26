const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../dao/sqldao');
const { sendEmail, wrapInHtml } = require('../services/emailService');





router.get('/templates', async (req, res) => {
    console.log('GET /templates');

    const templateName = req.query.templateName; // Get template name from query parameters

    if (!templateName) {
        res.status(400).json({ error: 'Template name is required' });
        return;
    }

    try {
        const pool = await poolPromise;
        console.log('EXECUTING QUERY ON DATABASE: SELECT CONTENT FROM [EmailTemplate] WHERE Name = @templateName');
        
        const result = await pool.request()
            .input('templateName', sql.NVarChar, templateName)
            .query('SELECT CONTENT FROM [EmailTemplate] WHERE Name = @templateName');

        if (result.recordset.length > 0) {
            const templateContent = result.recordset[0].CONTENT;
            res.status(200).json({
                status: 200,
                message: "Template found",
                data: templateContent
        });
        } else {
            res.status(404).json({ error: 'Template not found' });
        }
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Database Query Error' });
    }
});

router.post('/templates', async (req, res) => {
    console.log('POSt /templates');

    const templateName = req.body.templateName; // Get template name from body
    const content = req.body.content; // Get content from body

    if (!templateName || !content) {
        res.status(400).json({ error: 'Template name and/or content is required' });
        return;
    }

    try {
        const pool = await poolPromise;
        let query = 'UPDATE [EmailTemplate] SET Content = @content WHERE Name = @templateName';
        console.log('EXECUTING QUERY ON DATABASE: ' + query);
        await pool.request()
            .input('templateName', sql.NVarChar, templateName)
            .input('content', sql.NVarChar, content)
            .query(query);

        res.status(200).json({
            status: 200,
            message: "Email changed succesfully",
            data: {
                "templateName": templateName,
                "content": content
            }
        })
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Database Query Error' });
    }
});

// Fetch email template
router.get('/template/:name', async (req, res) => {
    const templateName = req.params.name;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('templateName', sql.NVarChar, templateName)
            .query('SELECT CONTENT FROM [EmailTemplate] WHERE Name = @templateName');

        if (result.recordset.length > 0) {
            res.status(200).json({
                status: 200,
                message: "Template found",
                data: result.recordset[0].CONTENT
            });
        } else {
            res.status(404).json({ error: 'Template not found' });
        }
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Database Query Error' });
    }
});

// Fetch user data
router.get('/mail-name/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const pool = await poolPromise;
        const query = `
     SELECT 
    u.Username,
    u.Email,
    w.WorkshopName,
    c.ClientName,
    com.StartTimeDay,
    com.EndTimeDay,
    cw.StartTime,
    cw.EndTime,
    com.Date,
    com.Address
FROM 
    "User" u
JOIN 
    CommissionWorkshopUser cwu ON u.UserId = cwu.UserId
JOIN 
    CommissionWorkshop cw ON cwu.CommissionWorkshopId = cw.CommissionWorkshopId
JOIN 
    Commission com ON cw.CommissionId = com.CommissionId
JOIN 
    Client c ON com.ClientId = c.ClientId
JOIN 
    Workshop w ON cw.WorkshopId = w.WorkshopId;
    `;
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(query);

        if (result.recordset.length > 0) {
            res.status(200).json({
                status: 200,
                message: "User data retrieved successfully",
                data: result.recordset
            });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Database Query Error' });
    }
});

// Utility function to format a date to 'DD-MM-YYYY'
function formatDate(date) {
    return new Date(date).toLocaleDateString('nl-NL'); // Locale set to Dutch (Netherlands)
}

// Utility function to format a time to 'HH:MM:SS'
function formatTime(date) {
    return new Date(date).toLocaleTimeString('nl-NL'); // Locale set to Dutch (Netherlands)
}   

// Helper function to replace placeholders in text with actual data
function replacePlaceholders(template, data) {
    let text = template;
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const placeholder = `{${key}}`;
            text = text.replace(new RegExp(placeholder, 'g'), data[key] || ''); // Replace with empty string if data is missing
        }
    }
    return text;
}

// Send email with template and user data
router.post('/send', async (req, res) => {
    const { userId, templateName, emailSubject, Reason } = req.body;

    try {
        const pool = await poolPromise;

        // Fetch template
        const templateResult = await pool.request()
            .input('templateName', sql.NVarChar, templateName)
            .query('SELECT CONTENT FROM [EmailTemplate] WHERE Name = @templateName');

        if (templateResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }
        const template = templateResult.recordset[0].CONTENT;

        // Fetch user data
        const userResult = await pool.request()
            .input('userId', sql.Int, userId)   
            .query(`
                SELECT 
                    u.Username,
                    u.Email,
                    w.WorkshopName,
                    c.ClientName,
                    CONVERT(VARCHAR(8), COALESCE(com.StartTimeDay, '00:00'), 108) AS StartTimeDay,
                    CONVERT(VARCHAR(8), COALESCE(com.EndTimeDay, '00:00'), 108) AS EndTimeDay,
                    CONVERT(VARCHAR(8), COALESCE(cw.StartTime, '00:00'), 108) AS StartTime,
                    CONVERT(VARCHAR(8), COALESCE(cw.EndTime, '00:00'), 108) AS EndTime,
                    FORMAT(com.Date, 'dd-MM-yyyy') AS Date,
                    com.Address
                FROM 
                    [User] u
                JOIN 
                    CommissionWorkshopUser cwu ON u.UserId = cwu.UserId
                JOIN 
                    CommissionWorkshop cw ON cwu.CommissionWorkshopId = cw.CommissionWorkshopId
                JOIN 
                    Commission com ON cw.CommissionId = com.CommissionId
                JOIN 
                    Client c ON com.ClientId = c.ClientId
                JOIN 
                    Workshop w ON cw.WorkshopId = w.WorkshopId
                WHERE 
                    u.UserId = @userId
            `);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        let userData = userResult.recordset[0];

        // Add Reason to userData
        userData.Reason = Reason;

        // Print userData for debugging
        console.log(userData);
        console.log(Reason);

        // Replace placeholders
        const emailText = replacePlaceholders(template, userData);

        // Wrap in HTML
        const emailHtml = wrapInHtml(emailText);

        // Send email
        await sendEmail(userData.Email, emailSubject, emailHtml);

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});


module.exports = router;

