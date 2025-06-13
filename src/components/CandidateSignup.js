import React, { useState } from 'react';
import './CandidateSignup.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import loginImage from '../login2.jpeg';

const CandidateSignup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:5000/candidate/signup', {
        name: name,
        email: email,
        password: password,
      });

      if (response.data.message === "Candidate signup successful!") {
        setSuccessMessage("Signup successful! You can now login.");
        setErrorMessage('');
      } else {
        setErrorMessage(response.data.message);
        setSuccessMessage('');
      }
    } catch (error) {
      setErrorMessage("Error occurred during signup.");
      setSuccessMessage('');
    }
  };

  return (
    <div className="candidate-body">
      <NavBar />
      
      <div className="candidate-signin-content">
        <div className="candidate-signin-image-side">
          <img src={loginImage} alt="Image" className="candidate-signin-image" />
        </div>
        
        <div className="candidate-form-side">
          <h2 className="candidate-text-center-sign">Candidate Signup</h2>
          <form onSubmit={handleSignup} className="candidate-form-container-signin" style={{marginTop: '5px', padding: '20px 30px'}}>
            
            <div className="mb-3">
              <label htmlFor="name" className="form-label" style={{fontWeight: 'bold', color: '#061f47', marginBottom: '1px'}}>Name</label>
              <input
                type="text"
                id="name"
                className="form-control"
                placeholder="Enter your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label" style={{fontWeight: 'bold', color: '#061f47', marginBottom: '1px'}}>Email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="Enter your Email id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label" style={{fontWeight: 'bold', color: '#061f47', marginBottom: '1px'}}>Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="candidate-signup-button">Sign Up</button>
            <p className="candidate-sign" style={{ fontWeight: 'bold', color: '#061f47', marginTop: '15px', textAlign: 'center' }}>
              Already have an account? 
              <Link to="/candidate-login" style={{ color: '#061f47', fontWeight: 'bold', marginLeft: '5px' }}>Login</Link>
            </p>
            {errorMessage && <div className="candidate-error-message">{errorMessage}</div>}
            {successMessage && <div className="candidate-success-message">{successMessage}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CandidateSignup;