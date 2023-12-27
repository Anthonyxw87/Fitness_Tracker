import React from 'react';
import { Line } from 'react-chartjs-2';

const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1); // Months are zero-based, so subtract 1
    return date.toLocaleString('default', { month: 'long' });
};

const StepsChart = ({ data, selectedMonth, handlePrevMonth, handleNextMonth }) => {
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Steps Chart',
            },
        },
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <button onClick={handlePrevMonth}>{'<'}</button>
                <h2 style={{ margin: '0 20px' }}>{getMonthName(selectedMonth)}</h2>
                <button onClick={handleNextMonth}>{'>'}</button>
            </div>
            <Line options={options} data={data} />
        </div>
    );
};

export default StepsChart;


