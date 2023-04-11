// import necessary modules
const express = require('express'); // web application framework for Node.js
const mysql = require('mysql2'); // MySQL database driver for Node.js
const bodyParser = require('body-parser'); // middleware for parsing request bodies
const cors = require('cors'); // middleware for enabling cross-origin resource sharing
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// create Express application instance
const app = express();
// enable Cross-Origin Resource Sharing (CORS) middleware
app.use(cors());

// create MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST, // database host
    user: process.env.DB_USER, // database user
    password: process.env.DB_PASSWORD, // database user password
    database: process.env.DB_DATABASE, // database name
});

// enable body-parser middleware for parsing request bodies as JSON objects
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const dashboard_URL = 'http://localhost:3000';

// function to generate token
function generateToken(userId) {
    const token = jwt.sign({ userId: userId }, 'secret');
    return token;
}

// define a route for handling POST requests to '/sign-up'
app.post('/sign-up', (req, res) => {
    // extract user data from request body
    const { firstName, lastName, email, password } = req.body;

    // insert user data into database using connection pool
    pool.query(
        'INSERT INTO Users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
        [firstName, lastName, email, password],
        (error, results) => {
            // if there is an error, log the error and return 500 Internal Server Error response
            if (error) {
                console.error(error);
                res.status(500).send('Error creating user');
            } else {
                // generate a unique token for the user
                const token = jwt.sign({ id: results.insertId }, process.env.JWT_SECRET);

                // if successful, return 201 Created response with success message, token, and redirect URL
                res.status(201).send({
                    token: token,
                    email: email,
                    redirectUrl: `${dashboard_URL}/dashboard`
                });
            }
        }
    );
});

// define a route for handling POST requests to '/user-information-insert'
app.post('/user-information-insert', (req, res) => {
    // extract user data from the request body
    const { email } = req.body;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: 'Unauthorized' });
    }

    const decodedToken = jwt.decode(token);
    const userId = decodedToken.id;

    // insert user-information data into user-information database using connection pool
    pool.query('INSERT INTO user_information (id, email, color) VALUES(?, ?, NULL)', [userId, email],
        (error, results) => {
            if (error) {
                // if there is an error, log the error and return 500 internal server error
                console.log(error);
                res.status(500).send('Error creating user_information');
            } else {
                //if successful, generate a token, store it in local storage and return it with response
                const token = generateToken(userId);
                res.status(200).send({
                    id: userId,
                    email: email,
                    color: null,
                    token: token
                });
            }
        });
});

// define a route for handling POST requests to '/sign-in'
app.post('/sign-in', (req, res) => {
    // extract user data from request body
    const { email, password } = req.body;

    // search for user in database using connection pool
    pool.query(
        'SELECT * FROM Users WHERE email = ? AND password = ?',
        [email, password],
        (error, results) => {
            // if there is an error, log the error and return 500 Internal Server Error response
            if (error) {
                console.error(error);
                res.status(500).send('Error signing in');
            } else if (results.length === 0) {
                // if no user is found with the given email and password, return 401 Unauthorized response
                res.status(401).send('Invalid email or password');
            } else {
                // return 200 OK response with user data and token
                const token = generateToken(results[0].id);
                res.status(200).send({
                    id: results[0].id,
                    email: results[0].email,
                    token: token,
                    redirectUrl: `${dashboard_URL}/dashboard`
                });
            }
        }
    );
});

// define a route for handling POST requests to '/user-information'
app.post('/user-information', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: 'Unauthorized' });
    }

    const decodedToken = jwt.decode(token);
    const userId = decodedToken.userId;
    // search for user in database using connection pool
    pool.query(
        'SELECT * FROM User_Information WHERE id = ?',
        [userId],
        (error, results) => {
            // if there is an error, log the error and return 500 Internal Server Error response
            if (error) {
                console.error(error);
                res.status(500).send({ message: 'Error getting data' });
            } else if (results.length === 0) {
                // if no user is found with the given id or the email in the token does not match the email in the database, return 401 Unauthorized response
                res.status(401).send({ message: 'Unauthorized' });
            } else {
                // if successful, return 200 OK response with user data
                res.status(200).send({
                    id: results[0].id,
                    email: results[0].email,
                    color: results[0].color,
                });
            }
        }
    );
});

// start listening for incoming requests on port 3001
app.listen(3001, () => {
    console.log('Server listening on port 3001');
});

