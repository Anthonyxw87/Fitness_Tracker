import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  BrowserRouter,
} from "react-router-dom";
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import Dashboard from './pages/Dashboard';

import { ThemeProvider } from '@material-ui/core/styles';
import theme from './config/theme.config';

function App() {
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);



  return (
    <Router>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<SignIn userData={userData} setUserData={setUserData} setIsLoading={setIsLoading} />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard userData={userData} isLoading={isLoading} />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
