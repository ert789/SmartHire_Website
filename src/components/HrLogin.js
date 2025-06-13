import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import './HrLogin.css';  
import loginImage from '../login2.jpeg';
import NavBar from './NavBar';

const HrLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loginUser = async (email, password) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) { 
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('role', data.role);
        localStorage.setItem('email', email);
        
        if (data.skip_otp) {
          window.location.href = '/hr-dashboard';
        } else {
          window.location.href = '/verify-code';
        }
      } else {
        setError(data.message || 'Login failed. Try again.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('An error occurred during login.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Both email and password are required');
      return;
    }
    setError('');
    setLoading(true);
    await loginUser(email, password);
    setLoading(false);
  };

  return (
    <div className="hr-login-body">
      <NavBar />
      <div className="hr-login-content">
        <div className="hr-login-image-side">
          <img src={loginImage} alt="Login Visual" className="hr-login-image" />
        </div>
        <div className="hr-login-form-side">
          <h2 className="hr-login-text-center">HR Manager Login</h2>
          <form className='hr-login-form' onSubmit={handleSubmit} style={{ marginTop: '5px', padding: '20px 30px' }}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label" style={{ fontWeight: 'bold', color: '#061f47', marginBottom: '1px' }}>Email:</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                placeholder="Enter your Email id"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label" style={{ fontWeight: 'bold', color: '#061f47', marginBottom: '1px' }}>Password:</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Enter your Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="hr-login-button w-100"
              style={{ 
                backgroundColor: '#061f47', 
                color: 'white', 
                fontWeight: 'bold',
                opacity: loading ? 0.7 : 1
              }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <p className="hr-login-forgot" style={{ fontWeight: 'bold', textAlign: 'center', marginTop: '15px' }}>
              <Link to="/forgot-password" style={{ color: '#061f47' }}>Forgot Password?</Link>
            </p>
            {error && <div className="hr-login-error-message">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default HrLogin;