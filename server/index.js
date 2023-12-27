// import necessary modules
const express = require('express'); // web application framework for Node.js
const path = require('path');
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

app.use(express.static(path.join(__dirname + "/public")))

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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

const CLIENT_URL = 'https://updated-fitness-app.herokuapp.com';

const currentYear = new Date().getFullYear();

// function to generate token
function generateToken(userId) {
    const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET);
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
                const token = jwt.sign({ userId: results.insertId }, process.env.JWT_SECRET);

                // if successful, return 201 Created response with success message, token, and redirect URL
                res.status(201).send({
                    token: token,
                    email: email,
                    redirectUrl: `${CLIENT_URL}/dashboard`
                });
            }
        }
    );
});

// define a route for handling POST requests to '/user-information-insert'
app.post('/user-information-insert', (req, res) => {
    // extract user data from the request body
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: 'Unauthorized' });
    }

    const decodedToken = jwt.decode(token);
    const userId = decodedToken.userId;

    // generate a token and return it with the response
    res.status(200).send({
        id: userId,
        date: null,
        num_steps: 0,
        color: null,
        hours_sleep: 0,
        token: token
    });
});


// define a route for handling POST requests to '/user-information-update'
app.post('/user-information-update', (req, res) => {
    // extract user data from the request body
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    const decodedToken = jwt.decode(token);
    const userId = decodedToken.userId;
    const { date, num_steps, hours_sleep } = req.body;

    // update user-information data in user-information database using connection pool
    pool.query(
        'UPDATE user_info SET num_steps = ?, hours_sleep = ? WHERE user_id = ? AND date = ?',
        [num_steps, hours_sleep, userId, date],
        (error, results) => {
            if (error) {
                // if there is an error, log the error and return 500 internal server error
                console.log(error);
                res.status(500).send('Error updating user_information');
            } else {
                res.status(200).send({
                    id: userId,
                    date: date,
                    num_steps: num_steps,
                    color: null,
                    hours_sleep: hours_sleep,
                    token: token
                });
            }
        }
    );
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
                    redirectUrl: `${CLIENT_URL}/dashboard`
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
    if (!decodedToken || !decodedToken.userId) {
        return res.status(400).send({ message: 'Invalid token' });
    }
    const userId = decodedToken.userId;
    const date = req.body.selectedDateAsISOString;

    // search for user in the database using connection pool
    pool.query(
        'SELECT * FROM user_info WHERE user_id = ? AND DATE(date) = ?',
        [userId, date],
        (error, results) => {
            // if there is an error, log the error and return a 500 Internal Server Error response
            if (error) {
                console.error(error);
                res.status(500).send({ message: 'Error getting data' });
            } else if (results.length === 0) {
                // if no user is found with the given ID or the date in the token does not match the email in the database
                // insert user-information data into the user-information database using the connection pool
                pool.query(
                    'INSERT INTO user_info (user_id, date, num_steps, color, hours_sleep) VALUES(?, ?, 0, NULL, 0)',
                    [userId, date],
                    (error, results) => {
                        if (error) {
                            // if there is an error, log the error and return a 500 Internal Server Error
                            console.log(error);
                            res.status(500).send('Error creating user_information');
                        } else {
                            // if successful, generate a token, store it in local storage, and return it with the response
                            const token = generateToken(userId);
                            res.status(200).send({
                                id: userId,
                                date: date,
                                num_steps: 0,
                                color: null,
                                hours_sleep: 0,
                                token: token
                            });
                        }
                    }
                );
            } else {
                // if successful, return a 200 OK response with user data
                const highestStepsQuery = 'SELECT MAX(num_steps) AS max_steps FROM user_info WHERE user_id = ?';
                const averageStepsQuery = 'SELECT AVG(num_steps) AS average_steps FROM user_info WHERE user_id = ? AND date >= DATE_SUB(?, INTERVAL 1 WEEK)';
                pool.query(
                    highestStepsQuery,
                    [userId],
                    (error, maxStepsResult) => {
                        if (error) {
                            console.error(error);
                            res.status(500).send({ message: 'Error getting data' });
                        } else {
                            const maxSteps = maxStepsResult[0].max_steps;
                            pool.query(
                                averageStepsQuery,
                                [userId, date],
                                (error, averageStepsResult) => {
                                    if (error) {
                                        console.error(error);
                                        res.status(500).send({ message: 'Error getting data' });
                                    } else {
                                        const averageSteps = averageStepsResult[0].average_steps;
                                        res.status(200).send({
                                            id: results[0].user_id,
                                            date: results[0].date,
                                            num_steps: results[0].num_steps,
                                            color: results[0].color,
                                            hours_sleep: results[0].hours_sleep,
                                            highest_steps_all_time: maxSteps,
                                            average_steps_past_week: averageSteps, // Add the average steps value
                                            token: token
                                        });
                                    }
                                }
                            );
                        }
                    }
                );
            }
        }
    );
});

app.post('/steps-data', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: 'Unauthorized' });
    }

    const decodedToken = jwt.decode(token);
    if (!decodedToken || !decodedToken.userId) {
        return res.status(400).send({ message: 'Invalid token' });
    }
    const userId = decodedToken.userId;
    const selectedMonth = req.body.selectedMonth;

    // Search for user information in the database within the specific month and year
    pool.query(
        'SELECT date, num_steps FROM user_info WHERE user_id = ? AND YEAR(date) = ? AND MONTH(date) = ?',
        [userId, currentYear, selectedMonth],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send({ message: 'Error getting data' });
            } else {
                const formattedResults = results.map((row) => ({
                    date: row.date,
                    num_steps: row.num_steps,
                }));
                res.status(200).send(formattedResults);
            }
        }
    );
});


const PORT = process.env.PORT

app.listen(PORT)