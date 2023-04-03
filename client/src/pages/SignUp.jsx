// Importing required dependencies from MUI and React
import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import { TextField } from '@mui/material';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Copyright from '../components/Copyright';
import { useNavigate } from "react-router-dom";


export default function SignUp({ userData, setUserData }) {
    const API_URL = 'http://localhost:3001';
    const initialUser = { id: null, firstName: '', lastName: '', email: '', password: '', error: null }

    const [user, setUser] = useState(initialUser);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // Handle change in form fields
    const handleChange = e => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value })
    }

    useEffect(() => {
        console.log(user.id);
        console.log(user.email);
    }, [user.id]);

    // Handle submit form event
    const handleSubmit = async (event) => {
        event.preventDefault();

        const { firstName, lastName, email, password } = user;

        try {
            setIsLoading(true);

            // Make request to sign up endpoint on backend
            const response = await fetch(`${API_URL}/sign-up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstName, lastName, email, password }),
            });

            console.log(response.status); // Add this line to log the response status code
            // Handle errors
            if (!response.ok) {
                throw new Error('Failed to create user');
            }
            // If successful, redirect to dashboard
            const data = await response.json();
            if (data.id) {
                setUser({ ...user, id: data.id, email: data.email });

                // Make request to create user information endpoint on backend
                const userInfoResponse = await fetch(`${API_URL}/user-information-insert`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: data.id,
                        email: data.email,
                    }),
                });
                // Handle errors
                if (!userInfoResponse.ok) {
                    throw new Error('Failed to create user information');
                }
                // Extract JSON data from response object
                const userInfoData = await userInfoResponse.json();
                setUserData({ ...userData, id: userInfoData.id, email: userInfoData.email, color: userInfoData.color });
                navigate("/dashboard", { state: { userData: userInfoData } }); // Pass userData to Dashboard component
                if (data.redirectUrl) {
                    handleRedirect(data.redirectUrl);
                }
            }

        } catch (err) {
            // If there is an error, set the error state in user object
            setUser({ ...user, error: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle redirect
    const handleRedirect = (url) => {
        window.location.href = url;
    }

    const isValid = user.firstName === '' || user.lastName === '' || user.email === '' || user.password === '';

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div style={{ width: '50%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img src={require('../img/fitness.jpg')} alt="example" style={{ width: '100%', height: '100%' }} />
            </div>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: -15,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: '#64dd17' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign up
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="normal"
                                name="firstName"
                                required
                                fullWidth
                                id="firstName"
                                label="First Name"
                                value={user.firstName}
                                autoFocus
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="lastName"
                                label="Last Name"
                                name="lastName"
                                value={user.lastName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                value={user.email}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={isLoading || isValid}
                        onClick={handleSubmit}
                    >
                        Sign Up
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Link href="/" variant="body2">
                                Already have an account? Sign in
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
                <Copyright sx={{ mt: 5 }} />
            </Container>
        </div>
    );
}
