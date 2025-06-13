import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CandidateLogin.css'; // Reuse existing login styles
import loginImage from '../login2.jpeg'; // Update the path if needed
import NavBar from './NavBar'; // Assuming you have a NavBar component

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/reset-password-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setMessage('✅ Password reset instructions sent to your email.');
            setError('');
        } catch (err) {
            setError(err.message || '❌ Error requesting password reset.');
            setMessage('');
        }
    };

    return (
        <div className="candidate-login-body">
            <NavBar />
            <div className="candidate-login-content">
                <div className="candidate-login-image-side">
                    <img src={loginImage} alt="Reset Password" className="candidate-login-login-image" />
                </div>
                <div className="candidate-login-form-side" >
                    <h2 className="candidate-login-text-center">Reset Password</h2>
                    <form className='candidate-login-form' onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label" style={{ fontWeight: 'bold', color: '#061f47' }}>
                                Email Address:
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                padding: '10px',
                                marginTop: '10px'
                            }}
                        >
                            Send Reset Link
                        </button>

                        {message && (
                            <div style={{ color: 'green', marginTop: '15px', textAlign: 'center', fontWeight: 'bold' }}>
                                {message}
                            </div>
                        )}
                        {error && (
                            <div className="candidate-login-error-message" style={{ color: 'red', marginTop: '15px', textAlign: 'center', fontWeight: 'bold' }}>
                                {error}
                            </div>
                        )}

                        <p className="log" style={{ fontWeight: 'bold', textAlign: 'center', marginTop: '15px' }}>
                            <Link to="/candidate-login" style={{ color: '#061f47' }}>Back to Login</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
