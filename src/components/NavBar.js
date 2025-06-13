import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import SmartHireLogo from '../SMLOGO.png';
import axios from 'axios';
import './NavBar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('user_id') && localStorage.getItem('role');

  // List of dashboard paths
  const dashboardPaths = [
    '/hr-dashboard',
    '/candidate-dashboard',
    
    // Add more if you have different dashboards
  ];

  const isOnDashboard = dashboardPaths.some(path => location.pathname.startsWith(path));

 const handleLogout = async () => {
  try {
    // Get user data from localStorage
    const userId = localStorage.getItem('user_id');
    const role = localStorage.getItem('role');
    const sessionId = localStorage.getItem('session_id');
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');

    // Debug logging
    console.log('Initiating logout for:', {
      userId,
      role,
      sessionId,
      email,
      name
    });

    // Validate required fields
    if (!userId || !role) {
      console.error('Missing required user data for logout');
      throw new Error('Missing user information');
    }

    // Validate role
    if (role !== 'candidate' && role !== 'hr') {
      console.error('Invalid role detected:', role);
      throw new Error('Invalid user role');
    }

    // Prepare logout request
    const logoutData = {
      user_id: userId,
      user_type: role,
      session_id: sessionId  // Include session ID if available
    };

    // Clear local storage immediately to prevent race conditions
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    localStorage.removeItem('session_id');
    localStorage.removeItem('email');
    localStorage.removeItem('name');

    // Make logout API call
    const response = await axios.post('http://127.0.0.1:5000/api/logout', logoutData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000  // 5 second timeout
    });

    // Validate response
    if (!response.data.success) {
      console.error('Logout API returned unsuccessful:', response.data);
      throw new Error(response.data.message || 'Logout failed');
    }

    console.log('Logout successful:', response.data);

    // Redirect to role selection page
    window.location.href = '/role-selection';

  } catch (error) {
    console.error('Logout error:', error);

    // Ensure localStorage is cleared even if API call fails
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    localStorage.removeItem('session_id');
    localStorage.removeItem('email');
    localStorage.removeItem('name');

    // Show user-friendly error message
    alert(`Logout failed: ${error.message || 'Please try again'}`);

    // Force redirect anyway
    window.location.href = '/role-selection';
  }
};

  return (
    <header className="navbar-header">
      <NavLink to="/" className="navbar-logo">
        <img src={SmartHireLogo} alt="Logo" className="navbar-logo-img" />
        <h1 className="navbar-title">SmartHire</h1>
      </NavLink>
      <nav>
  {/* Show Login only when user is NOT logged in or NOT on dashboard */}
  {(!isLoggedIn || !isOnDashboard) && (
    <NavLink
      to="/role-selection"
      className={({ isActive }) => (isActive ? 'navbar-link active-link' : 'navbar-link')}
    >
      Login
    </NavLink>
  )}

  <NavLink
    to="/contact-us"
    className={({ isActive }) => (isActive ? 'navbar-link active-link' : 'navbar-link')}
  >
    Contact us
  </NavLink>

  {/* Show Logout only when user is logged in AND on dashboard */}
  {isLoggedIn && isOnDashboard && (
    <span onClick={handleLogout} className="navbar-link logout-link">
      Logout
    </span>
  )}
</nav>
    </header>
  );
};

export default Navbar;
