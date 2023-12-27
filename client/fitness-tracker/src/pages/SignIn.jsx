import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import { TextField } from '@mui/material/';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Copyright from '../components/Copyright';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SignIn({ userData, setUserData }) {
    const CLIENT_URL = 'https://updated-fitness-app.herokuapp.com';
    // Define initial user state
    const [isLoading, setIsLoading] = useState(false);
    // Define user state and isLoading state using useState hook
    const [user, setUser] = useState({ email: '', password: '', error: null });

    // Determine if the form is valid by checking if email and password are empty
    const isValid = user.email === '' || user.password === '';

    const navigate = useNavigate();

    // Handle change event on input fields
    const handleChange = e => {
        // Set user state with updated value
        setUser({ ...user, [e.target.name]: e.target.value })
    }

    // Log user ID and email when the user ID changes
    useEffect(() => {

    }, [user.id]);

    useEffect(() => {
        console.log('userData changed:', userData);
    }, [userData]);

    // Handle submit event on form
    const handleSubmit = async (event) => {
        event.preventDefault();

        const { email, password } = user;

        try {
            setIsLoading(true);

            // Make request to sign in endpoint on backend
            const response = await fetch(`${CLIENT_URL}/sign-in`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            // Handle errors
            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message);
            }

            // If successful, set user state with ID and email, and store token in local storage
            const data = await response.json();
            if (data.id) {
                setUser({ ...user, id: data.id, email: data.email });
                localStorage.setItem('token', data.token); // Store token in local storage

                // Make request to get user data from another table
                const userDataResponse = await fetch(`${CLIENT_URL}/user-information`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${data.token}` // Include token in headers
                    },
                });
                const userData2 = await userDataResponse.json();
                setUserData({
                    ...userData,
                    id: userData2.id,
                    date: userData2.date,
                    num_steps: userData2.num_steps,
                    color: userData2.color,
                    hours_sleep: userData2.hours_sleep,
                    token: userData2.token,
                });
                navigate("/dashboard", { state: { userData: userData2 } }); // Pass userData to Dashboard component

                if (data.redirectUrl) {
                    handleRedirect(data.redirectUrl);
                }
            }

        } catch (err) {
            // If there is an error, set the error state in user object
            setUser({ ...user, error: err.message });
            toast.error('Username and/or Password does not match');
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle redirect
    const handleRedirect = (url) => {
        window.location.href = url;
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div style={{ width: '50%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img src={require('../img/fitness.jpg')} alt="example" style={{ width: '100%', height: '100%' }} />
            </div>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: -20,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: '#64dd17' }}>

                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        value={user.email}
                        autoFocus
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        placeholder=''
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isLoading || isValid}
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                    <Grid container>
                        <Grid item xs>
                            <Link href="#" variant="body2">
                                Forgot password?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link href="/sign-up" variant="body2">
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                    <Copyright sx={{ mt: 5 }} />
                </Box>
            </Container>
            {/*TOASTER CONTAINER SO TOASTS CAN DISPLAY */}
            <ToastContainer
                position="top-right"
                autoClose={2500}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
}