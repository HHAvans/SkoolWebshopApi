const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../dao/sqldao');




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




router.post('/send', async (req, res) => {
    const { to, subject, template } = req.body;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Email', sql.VarChar, to)
            .query('SELECT UserId, Username FROM [User] WHERE Email = @Email');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.recordset[0];

        const data = { userName: user.Username };

        await sendEmail(to, subject, template, data);

        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Failed to send email', details: error });
    }
});

module.exports = router;

