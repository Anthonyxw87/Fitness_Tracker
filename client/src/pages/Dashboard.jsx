import React from 'react';
import { useLocation } from 'react-router-dom';

function Dashboard() {
    const location = useLocation();
    const userData = location.state?.userData;

    if (!userData) {
        // Redirect to sign-in page
        window.location.href = '/';
        return null;
    }

    console.log(userData.id);
    console.log(userData.email);
    console.log(userData.color);

    return (
        <div>
            <h1>Dashboard</h1>
            <p>User ID: {userData.id}</p>
            <p>User Email: {userData.email}</p>
            <p>Color: {userData.color}</p>
            {/* Display other user data here */}
        </div>
    );
}

export default Dashboard;
