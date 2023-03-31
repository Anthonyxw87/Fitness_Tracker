// import necessary modules
const express = require('express'); // web application framework for Node.js
const mysql = require('mysql2'); // MySQL database driver for Node.js
const bodyParser = require('body-parser'); // middleware for parsing request bodies
const cors = require('cors'); // middleware for enabling cross-origin resource sharing
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
                // if successful, return 201 Created response with success message and redirect URL
                res.status(201).send({
                    id: results.insertId,
                    email: email,
                    redirectUrl: `${dashboard_URL}/dashboard`
                });
            }
        }
    );
});

// define a route for handling POST requests to '/sign'
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
                // if successful, return 200 OK response with user data
                res.status(200).send({
                    id: results[0].id,
                    email: results[0].email,
                    redirectUrl: `${dashboard_URL}/dashboard`
                });
            }
        }
    );
});

// define a route for handling POST requests to '/user-information'
app.post('/user-information', (req, res) => {
    // extract user ID from request body
    const userId = req.body.userId;

    // search for user in database using connection pool
    pool.query(
        'SELECT * FROM User_Information WHERE id = ?',
        [userId],
        (error, results) => {
            // if there is an error, log the error and return 500 Internal Server Error response
            if (error) {
                console.error(error);
                res.status(500).send('Error getting data');
            } else if (results.length === 0) {
                // if no user is found with the given id, return 401 Unauthorized response
                res.status(401).send('Invalid user');
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

