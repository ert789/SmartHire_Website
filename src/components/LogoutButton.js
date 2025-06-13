import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      
      // Clear local storage first to prevent any automatic relogin
      localStorage.removeItem('user_id');
      localStorage.removeItem('role');
      localStorage.removeItem('session_id');
      localStorage.removeItem('email');
      localStorage.removeItem('name');

      if (!userId) {
        navigate('/role-selection');
        return;
      }

      // Make logout API call after clearing local storage
      const response = await axios.post('http://127.0.0.1:5000/api/logout', {
        user_id: userId
      });

      if (response.data.success) {
        // Force hard redirect to completely reset the app state
        window.location.href = '/role-selection';
      } else {
        alert('Logout failed: ' + (response.data.message || 'Unknown error'));
        window.location.href = '/role-selection';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force hard redirect on error
      window.location.href = '/role-selection';
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  );
};

export default LogoutButton;
