const mysql = require('mysql2')

const dbConfig = {
    host: '145.49.9.132',
    port: 3306,
    user: 'remote_user',
    password: 'secret',
    database: 'skoolworkshop',

    connectionLimit: 10,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
}

const pool = mysql.createPool(dbConfig)

module.exports = pool