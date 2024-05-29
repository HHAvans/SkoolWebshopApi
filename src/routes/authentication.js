const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../dao/sqldao.js');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
require('dotenv').config();


/** Login route
 * 
 *  This route is used at the start of the website at the login. With an email and password
 *  it generates an JSON Web Token to acces the rest of the website which is send back to the website.
 * 
 *  EXPECTED JSON BODY
 
{
    "email": "example@mail.com",
    "password": "123"
}

 */
router.post('/login', async (req, res) => {
    console.log('POST /auth/login');

    const email = req.body.email
    const password = req.body.password
    let result;

    let salt = bcrypt.hashSync(password, bcrypt.genSaltSync(10))

    try {
        const pool = await poolPromise;
        console.log(`EXECUTING QUERY ON DATABASE: SELECT Password FROM [User] WHERE Email = '${email}'`)
        result = await pool.request().query(`SELECT Password FROM [User] WHERE Email = '${email}'`);
    } catch (error) {
        console.error('Database query error:', error);
        return res.status(500).json({ error: 'Database Query Error' });
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

    if (bcrypt.compareSync(result.recordset[0].Password, bcrypt.hashSync(password, salt))) {
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