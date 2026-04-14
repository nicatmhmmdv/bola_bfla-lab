require('dotenv').config()
const { Pool } = require('pg')


const pool = new Pool ({
    host: process.env.db_host,
    user: process.env.db_user,
    database: process.env.db_name,
    password: process.env.db_pass
});

module.exports = pool;