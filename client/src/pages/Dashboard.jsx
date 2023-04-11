import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Dashboard() {
    const location = useLocation();
    const userData = location?.state?.userData;
    const navigate = useNavigate();

    useEffect(() => {
        if (!userData) {
            navigate('/');
        }
    }, [userData, navigate]);

    return (
        <div>
            <h1>Dashboard</h1>
            {userData ? (
                <div>
                    <p>User ID: {userData.id}</p>
                    <p>User Email: {userData.email}</p>
                    <p>Color: {userData.color}</p>
                    {/* Display other user data here */}
                </div>
            ) : null}
        </div>
    );
}

export default Dashboard;
