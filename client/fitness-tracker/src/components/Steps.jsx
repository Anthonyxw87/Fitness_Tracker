import React from 'react';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';

const Steps = ({ numSteps, highestStepsAllTime, averageStepsPastWeek }) => {
    return (
        <div>
            <h2>Steps</h2>
            <p>
                <DirectionsRunIcon style={{ verticalAlign: 'middle' }} fontSize="small" /> Today: <strong>{numSteps}</strong>
            </p>
            <p>
                Avg Steps This Week: {averageStepsPastWeek}
            </p>
            <p>
                All-Time High: <strong>{highestStepsAllTime}</strong>
            </p>
        </div>
    );
};

export default Steps;
