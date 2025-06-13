import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CandidateLogin.css';
import loginImage from '../login2.jpeg';
import NavBar from './NavBar';
 
const CandidateLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (email, password) => {
        try { 
            setError('');
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            localStorage.setItem('user_id', data.user_id);
            localStorage.setItem('role', data.role);
            localStorage.setItem('email', email);
            
            if (data.skip_otp) {
                navigate('/candidate-dashboard');
            } else {
                navigate('/verify-code');
            }
        } catch (err) {
            setError(err.message || 'An error occurred during login');
            console.error('Login error:', err);
        }
    };

    const handleSubmit = (e) => { 
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }
        
        setLoading(true);
        handleLogin(email, password) 
            .finally(() => setLoading(false));
    };

    return (
        <div className="candidate-login-body">
            <NavBar />
            <div className="candidate-login-content">
                <div className="candidate-login-image-side">
                    <img src={loginImage} alt="Login" className="candidate-login-image" />
                </div>
                <div className="candidate-login-form-side"> 
                    <h2 className="candidate-login-text-center">Candidate Login</h2>
                    <form className='candidate-login-form' onSubmit={handleSubmit} style={{marginTop: '5px', padding: '20px 30px'}}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label" style={{fontWeight: 'bold', color: '#061f47', marginBottom: '1px'}}>Email:</label>
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
                            <label htmlFor="password" className="form-label" style={{fontWeight: 'bold', color: '#061f47', marginBottom: '1px'}}>Password:</label>
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
                            className="candidate-login-button w-100" 
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
                        <p className='candidate-login-sign' style={{fontWeight: 'bold', color: '#061f47', marginTop: '15px', textAlign: 'center'}}>
                            Don't have an Account?
                            <Link to="/candidate-signup" style={{color: '#061f47', fontWeight: 'bold', marginLeft: '5px'}}>
                                Sign up
                            </Link>
                        </p>
                        <p className="candidate-login-forgot" style={{fontWeight: 'bold', textAlign: 'center'}}>
                            <Link to="/forgot-password" style={{color: '#061f47'}}>Forgot Password?</Link>
                        </p>
                        {error && (
                            <div className="candidate-login-error-message">
                                {error}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CandidateLogin;