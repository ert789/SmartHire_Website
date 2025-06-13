import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';
import hrIcon from './hr-icon.png';
import candidateIcon from './candidate-icon.png';
import './RoleSelection.css'; // Add a CSS file for styling
import Footer from './Footer.js'
 

const RoleSelection = () => {
  return (
    <div>
      <NavBar />
      <div className="role-selection-container text-center" style={{marginTop: '0px'}}>
        <h1 className="role-selection-title">Choose Your Role</h1>
        <div className="role-options">
          <Link to="/hr-login" className="role-card">
            <img src={hrIcon} alt="HR Icon" className="role-icon" />
            <h2 className="role-name">HR Manager Login</h2>
          </Link>
          <Link to="/candidate-login" className="role-card">
            <img src={candidateIcon} alt="Candidate Icon" className="role-icon" />
            <h2 className="role-name">Candidate Login</h2>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RoleSelection;