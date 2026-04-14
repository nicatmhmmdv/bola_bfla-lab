require('dotenv').config()
const jwt = require('jsonwebtoken')
const express = require('express');
const app = express();
const pool = require('./db');


//app.use('/api/auth', authRoutes);                 "prefix"
app.use(express.json()); //to parse json

//######################## TEST DB CONNECTION##############
// (async () =>  {
//     try {
//         const res = await pool.query('select now()');
//         console.log('succes: ', res.rows[0].now);
//         process.exit(0);
//     }
//     catch(err)
//     {
//         console.log('some error: ', err.message);
//     }

// })();

// AUTHENTICATION MIDDLEWARE
function authentication(req, res, next)
{
    const auth_header = req.headers.authorization;
    if (!auth_header)
    {
        return res.status(401).json({message: 'Something went wrong!'});
    }

    try 
    {
        const token = auth_header.split(' ')[1];
        //jwt.verify(token, process.env.jwt_secret); returns decoded payload
        decoded = jwt.verify(token, process.env.jwt_secret);

        req.user = decoded;
        next();
    }
    catch(err)
    {
        return res.status(403).json({message: 'Something went wrong!'});
    }
}


// /api/v1/login
app.post('/api/v1/login', async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await pool.query('select * from users where username = $1 and password = $2 limit 1', [username, password]);
        //if(!user) { // user object is not null  NOTE: works with findOne (i guess)
        if (user.rowCount === 0){
            return res.status(401).json({error: 'AUTH failed.'});
        }
        //console.log("[-] !user passed");

        const result = user.rows[0];
        const payload = {
            id: result.id,
            role: result.role,
            context: 'access_token'
        };
        token = jwt.sign(payload, process.env.jwt_secret, {expiresIn: '1h'});
        res.json({message: 'Login successful', token: token});
        //without jwt
        //res.json({message: 'Login successful', user: {id: result.id, username: result.username, role: result.role}});
    }
    catch(err)
    {
        console.error(err.message);
        return res.status(500).json({error: 'UNEXPECTED'});
    }
});

// /api/v1/register
app.post('/api/v1/register', async(req, res) => {
    try {
        const {username, password} = req.body;
        if (!username || !password)
        {
            return res.status(400).json({message: 'Please, fill all the fields'});
        }

        const exists = await pool.query('select * from users where username = $1 limit 1', [username]);
        if (exists.rows.length > 0)
        {
            return res.status(400).json({message: 'User already exists'});
        }

        const new_user = await pool.query('insert into users (username, password, role) values ($1, $2, $3) returning id', [username, password, 'user']);
        res.status(201).json({message: 'User created successfully', user: {id: new_user.rows[0].id, username: username}});
    }
    catch(err)
    {
        console.error(err.message);
        return res.status(500).json({error: 'UNEXPECTED'});
    }
});

app.get('/api/v1/resources/:id', authentication, async (req, res) => {
    try 
    {
        const id = req.params.id;
        const result = await pool.query('select * from resources where id = $1', [id]);
        
        // ###########################  SECURE  ###########################
        // if (id !== req.user.id) 
        // {
        //     return res.status(401).json({message: 'not authorized'});
        // }

        if (result.rows.length > 0)
        {
            res.status(200).json({message: 'Here is some notes', notes: result.rows[0]});
        }
    }
    catch(err)
    {
        console.log(err.message);
        return res.status(500).json({error: 'UNEXPECTED'});
    }


});

const port = process.env.port;
app.listen(port, () => {
    console.log(`app started on port ${port}`)
});

//console.log(port); # debug dotenv conf