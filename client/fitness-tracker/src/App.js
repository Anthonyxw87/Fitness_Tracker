import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';

function App() {
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn userData={userData} setUserData={setUserData} setIsLoading={setIsLoading} />} />
        <Route path="/sign-in" element={<SignIn userData={userData} setUserData={setUserData} setIsLoading={setIsLoading} />} />
        <Route path="/sign-up" element={<SignUp userData={userData} setUserData={setUserData} setIsLoading={setIsLoading} />} />
        <Route path="/dashboard" element={<Dashboard userData={userData} isLoading={isLoading} />} />
      </Routes>
    </Router>
  );
}

export default App;
