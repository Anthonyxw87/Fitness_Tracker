import React from 'react';
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
  return (
    <Router>
      <ThemeProvider theme={theme}>
          <Routes>
            <Route path="/" element={<SignIn />}>
            </Route>
            <Route path="/sign-up" element={<SignUp />}>
            </Route>
            <Route path="/dashboard" element={<Dashboard />}>
            </Route>
          </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
