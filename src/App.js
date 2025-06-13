import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import RoleSelection from './components/RoleSelection';
import CandidateLogin from './components/CandidateLogin';
import CandidateSignup from './components/CandidateSignup';
import VerifyCode from './components/VerifyCode';
import HrLogin from './components/HrLogin';
import CandidateDashboard from './components/CandidateDashboard';
import HrDashboard from './components/HrDashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ContactUs from './components/ContactUs';

function App() {
    const [userRole, setUserRole] = useState(null);  // 'hr' or 'candidate'
    const [userId, setUserId] = useState(null);

    const handleLogin = (role, id) => {
        setUserRole(role);
        setUserId(id);
    };

    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/role-selection" element={<RoleSelection />} />
                    <Route path="/candidate-login" element={<CandidateLogin onLogin={handleLogin} />} />
                    <Route path="/candidate-signup" element={<CandidateSignup />} />
                    <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
                    <Route path="/hr-dashboard" element={<HrDashboard />} />
                    <Route path="/verify-code" element={<VerifyCode />} />
                    <Route path="/hr-login" element={<HrLogin onLogin={handleLogin} />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/contact-us" element={<ContactUs />} />
                </Routes>
            </div>
        </Router>
    );
} 

export default App;