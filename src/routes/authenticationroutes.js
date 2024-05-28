const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../dao/sqldao.js');
const jwt = require('jsonwebtoken')
require('dotenv').config();

// Route to get all users
router.post('/login', async (req, res) => {
    console.log('POST /auth/login');

    const email = req.body.email
    const password = req.body.password
    let result;

    try {
        const pool = await poolPromise;
        result = await pool.request().query(`SELECT Password FROM [User] WHERE Email = '${email}'`);
        console.log(`EXECUTING QUERY ON DATABASE: SELECT Password FROM [User] WHERE Email = '${email}'`)
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Database Query Error' });
    }

    //If no passwords are found with that email
    if (result.recordset.length === 0) {
        console.log('POST /auth/login no user found');
        return res.status(401).json({
            status: 401,
            message: "Invalid credentials",
            data: {}
        })
    }

    if (password != result.recordset[0].Password) {
        //Invalid password
        console.log('POST /auth/login invalid password');
        return res.status(401).json({
            status: 401,
            message: "Invalid credentials",
            data: {}
        })
    } else {
        //Succesful login
        console.log('POST /auth/login succes');
        const token = jwt.sign({
            id: result.recordset[0].UserId,
            username: result.recordset[0].Username
        }, process.env.JWT_SECRET, {expiresIn: '1h'})
        res.status(200).json({
            status: 200,
            message: "Login succesful",
            data: { token }
        })
    }
});

module.exports = router;