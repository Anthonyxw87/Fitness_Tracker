import * as React from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { mainListItems } from '../components/listItems';
import { format, set } from 'date-fns';
import Steps from '../components/Steps';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '@mui/material/Button';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DoNotDisturbAltRoundedIcon from '@mui/icons-material/DoNotDisturbAltRounded';
import StepsChart from '../components/StepsChart';
import Chart from 'chart.js/auto';


// Set the width of the drawer
const drawerWidth = 240;

// Define the style for the AppBar component
const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

// Define the style for the Drawer component
const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    '& .MuiDrawer-paper': {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        boxSizing: 'border-box',
        ...(!open && {
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            width: theme.spacing(7),
            [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9),
            },
        }),
    },
}));

// Create the Material-UI theme
const mdTheme = createTheme();

const CLIENT_URL = 'https://updated-fitness-app.herokuapp.com';

export default function Dashboard() {
    const location = useLocation();
    const userData = location?.state?.userData;
    const token = userData?.token ?? null;
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [userInfo, setUserInfo] = useState(null);
    const [open, setOpen] = useState(true);

    const [openTask, setOpenTask] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [numStepsValidator, setNumStepsValidator] = React.useState('');
    const [hoursSleptValidator, setHoursSleptValidator] = React.useState('');
    const [numSteps, setNumSteps] = useState('');
    const [hoursSleptForm, setHoursSleptForm] = useState('');
    const [stepsData, setStepsData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(selectedDate.getMonth() + 1);

    // Handle logic for displaying the previous month's data
    const handlePrevMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    // Handle logic for displaying the next month's data
    const handleNextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    // sets openTask to true which opens up the dialog
    const handleClickOpen = () => {
        setOpenTask(true);
    };

    // sets openTask to false which closes the dialog
    const handleClickClosed = () => {
        setOpenTask(false);
    };

    // resets everything back to default whenever the dialog is cancelled
    const reset = () => {
        setNumSteps('');
        setHoursSleptForm('');
        setError(false);
        setNumStepsValidator('');
        setHoursSleptValidator('');
    };


    // add/updates a row in the user-info database
    let add = async () => {
        try {
            const selectedDateUTC = new Date(
                Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0)
            );
            const selectedDateAsISOString = selectedDateUTC.toISOString().slice(0, 10);

            // Create the request body
            const requestBody = {
                date: selectedDateAsISOString,
                num_steps: numSteps,
                hours_sleep: hoursSleptForm
            };

            // Send the POST request to update user info
            const response = await fetch(`${CLIENT_URL}/user-information-update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error('Failed to update user info');
            }

            // Close the dialog or perform any other necessary actions
            handleClickClosed();

            //reset the form
            reset();

            // Update the user info
            async function fetchData() {
                try {
                    const userInfoResponse = await fetchUserInfo();
                    const userInfo = await userInfoResponse.json();
                    setUserInfo(userInfo);
                } catch (error) {
                    console.error(error);
                }
            }

            fetchData();

            // Update the user info
        } catch (error) {
            // Handle any errors that occurred during the request
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        if (!userData || !token) {
            navigate('/');
            return;
        }

        async function fetchData() {
            try {
                const userInfoResponse = await fetchUserInfo();
                const userInfo = await userInfoResponse.json();
                setUserInfo(userInfo);
            } catch (error) {
                console.error(error);
            }
        }

        fetchData();
    }, [selectedDate, token, userData, navigate]);

    useEffect(() => {
        async function fetchStepsData() {
            try {
                const stepsDataResponse = await fetchStepsDataFromServer();
                const stepsData = await stepsDataResponse.json();
                setStepsData(stepsData);
            } catch (error) {
                console.error(error);
            }
        }
        fetchStepsData();
    }, [selectedMonth, selectedDate, numSteps, token]);

    async function fetchStepsDataFromServer() {
        const response = await fetch(`${CLIENT_URL}/steps-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                selectedMonth
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch steps data');
        }
        return response;
    }


    async function fetchUserInfo() {
        const selectedDateUTC = new Date(
            Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0)
        );
        const selectedDateAsISOString = selectedDateUTC.toISOString().slice(0, 10);
        const response = await fetch(`${CLIENT_URL}/user-information`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                selectedDateAsISOString
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }

        return response;
    }

    function toggleDrawer() {
        setOpen(!open);
    }

    if (!userInfo) {
        return <div>Loading...</div>;
    }

    const chartData = {
        labels: stepsData.map((entry) => {
            const date = new Date(entry.date);
            const month = date.getMonth() + 1; // Months are zero-based, so add 1
            const day = date.getDate();
            return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
        }),
        datasets: [
            {
                label: 'Steps',
                data: stepsData.map((entry) => entry.num_steps),
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 2,
            },
        ],
    };



    const { id, color, num_steps, hours_sleep, highest_steps_all_time, average_steps_past_week } = userInfo;
    const date = userInfo.date ? new Date(userInfo.date).toLocaleDateString('en-US', { timeZone: 'UTC' }) : null;
    return (
        <ThemeProvider theme={mdTheme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar position="absolute" open={open}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1 }}
                            style={{ fontWeight: 'bold' }}
                        >
                            Dashboard
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => {
                                handleClickOpen(); // opens up the dialog when clicked
                            }}
                            sx={{ marginRight: '20px' }}
                        >
                            <AddCircleIcon />
                            &nbsp; ADD
                        </Button>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ marginRight: '14pt', display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1rem', verticalAlign: 'middle' }}>
                                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : null}
                                </span>
                            </div>
                            <DatePicker
                                selected={selectedDate}
                                onChange={newDate => setSelectedDate(newDate)}
                                dateFormat="MM/dd/yyyy"
                                showPopperArrow={false}
                                customInput={
                                    <div style={{ position: 'relative' }}>
                                        <CalendarMonthIcon sx={{ marginBottom: '-5px', marginLeft: '-10px' }} />
                                    </div>
                                }
                            />
                        </div>

                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open}>
                    <Toolbar>
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List>
                        {mainListItems}
                    </List>
                </Drawer>
                <Box sx={{ flexGrow: 1, p: 3 }}>
                    {/* Main content */}
                    <Container maxWidth="lg" sx={{ mt: 4 }}>
                        <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }}>
                            <Grid item xs={12} md={4} sx={{ mt: 4 }}>
                                <Paper elevation={1} sx={{ p: 2, border: "1px solid rgba(0, 0, 0, 0.1)", height: "100%" }}>
                                    <div>
                                        <p>User ID: {id}</p>
                                        <p>Date: {date}</p>
                                        <p>Color: {color}</p>
                                        <p>Hours of Sleep: {hours_sleep}</p>
                                        <Steps
                                            numSteps={num_steps}
                                            highestStepsAllTime={highest_steps_all_time}
                                            averageStepsPastWeek={average_steps_past_week}
                                        />
                                    </div>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4} sx={{ mt: 4 }}>
                                <Paper elevation={1} sx={{ p: 2, border: "1px solid rgba(0, 0, 0, 0.1)" }}>
                                    <Steps numSteps={numSteps} />
                                    {/* Component 2 */}
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4} sx={{ mt: 4 }}>
                                <Paper elevation={1} sx={{ p: 2, border: "1px solid rgba(0, 0, 0, 0.1)" }}>
                                    <Steps numSteps={numSteps} />
                                    {/* Component 3 */}
                                </Paper>
                            </Grid>
                        </Grid>
                        <Box sx={{ pt: 4 }}>
                            <Grid container spacing={3} sx={{ mt: 4, justifyContent: 'center', alignItems: 'center' }}>
                                <Grid item xs={12} md={8} lg={9}>
                                    {/* Chart component */}
                                    <Paper elevation={1} sx={{ p: 2, border: "1px solid rgba(0, 0, 0, 0.1)", width: '125%' }}>
                                        <StepsChart
                                            data={chartData}
                                            selectedMonth={selectedMonth}
                                            handlePrevMonth={handlePrevMonth}
                                            handleNextMonth={handleNextMonth}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={4} lg={3}>
                                    {/* Other component */}
                                </Grid>
                                <Grid item xs={12}>
                                    {/* Table component */}
                                </Grid>
                            </Grid>
                        </Box>


                        <Dialog open={openTask} onClose={handleClickClosed} fullWidth maxWidth="sm">
                            <DialogTitle sx={{ bgcolor: 'primary.dark', color: 'white' }}>
                                <AddCircleIcon fontSize="small" />
                                Add Task
                            </DialogTitle>
                            <br />
                            <DialogContent>
                                {/* Number Of Steps */}
                                {openTask && (
                                    <TextField
                                        error={error}
                                        sx={{ width: 1 }}
                                        id="numStepsInput"
                                        label="Number Of Steps"
                                        placeholder="Type number of steps ..."
                                        helperText={numStepsValidator}
                                        value={numSteps}
                                        onChange={(e) => {
                                            const input = e.target.value;
                                            const numericInput = input.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                                            setNumSteps(numericInput);
                                        }}
                                    />
                                )}

                                {openTask && <br />}
                                {openTask && <br />}
                                {/* Hours Of Sleep */}
                                <TextField
                                    error={error}
                                    sx={{ width: 1 }}
                                    id="hoursinput"
                                    label="Hours Of Sleep"
                                    placeholder="Type hours slept ..."
                                    helperText={hoursSleptValidator}
                                    value={hoursSleptForm}
                                    onChange={(e) => {
                                        const input = e.target.value;
                                        const numericInput = input.replace(/[^0-9.]/g, ''); // Remove non-numeric and non-decimal characters
                                        setHoursSleptForm(numericInput);
                                    }}
                                    inputProps={{
                                        step: '0.01',
                                        type: 'number',
                                    }}
                                />

                                <br />
                                <br />
                                {/* Date Picker */}
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ marginRight: '14pt', display: 'flex', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '1rem', verticalAlign: 'middle' }}>
                                            {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : ''}
                                        </span>
                                    </div>
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={newDate => setSelectedDate(newDate)}
                                        dateFormat="MM/dd/yyyy"
                                        showPopperArrow={false}
                                        customInput={
                                            <div style={{ position: 'relative' }}>
                                                <CalendarMonthIcon sx={{ marginBottom: '-5px', marginLeft: '-10px' }} />
                                            </div>
                                        }
                                    />
                                </div>
                                <br />
                            </DialogContent>

                            <DialogActions sx={{ bgcolor: 'white' }}>
                                <Button
                                    onClick={() => {
                                        add();
                                    }}
                                    variant="contained"
                                    sx={{ width: '35%' }}
                                    autoFocus
                                >
                                    <AddCircleIcon fontSize="small" />
                                    Add
                                </Button>

                                <Button
                                    onClick={() => {
                                        handleClickClosed();
                                        reset();
                                    }}
                                    variant="contained"
                                    sx={{ bgcolor: 'red', width: '35%' }}
                                    autoFocus
                                >
                                    <DoNotDisturbAltRoundedIcon fontSize="small" />
                                    CANCEL
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Container>
                </Box>
            </Box>
        </ThemeProvider>
    );
}