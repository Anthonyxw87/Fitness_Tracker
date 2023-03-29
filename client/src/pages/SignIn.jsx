import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import { TextField } from '@mui/material/';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Copyright from '../components/Copyright'


export default function SignIn() {
    const API_URL = 'http://localhost:3001';
    // Define initial user state
    const initialUser = { id: null, email: '', password: '', error: null }

    // Define user state and isLoading state using useState hook
    const [user, setUser] = useState(initialUser);
    const [isLoading, setIsLoading] = useState(false);

    // Determine if the form is valid by checking if email and password are empty
    const isValid = user.email === '' || user.password === '';

    // Handle change event on input fields
    const handleChange = e => {
        // Set user state with updated value
        setUser({ ...user, [e.target.name]: e.target.value })
    }

    // Log user ID and email when the user ID changes
    useEffect(() => {
        console.log(user.id);
        console.log(user.email);
    }, [user.id]);

    // Handle submit event on form
    const handleSubmit = async (event) => {
        event.preventDefault();

        const { email, password } = user;

        try {

            setIsLoading(true);

            // Make request to sign in endpoint on backend
            const response = await fetch(`${API_URL}/sign-in`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            // Log the response status code
            console.log(response.status);

            // Handle errors
            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message);
            }

            // If successful, set user state with ID and email
            const data = await response.json();
            if (data.id) {
                setUser({ ...user, id: data.id, email: data.email });
            }

            // Handle redirect
            if (data.redirectUrl) {
                handleRedirect(data.redirectUrl);
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
                        <LockOutlinedIcon />
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
        </div>
    );
}