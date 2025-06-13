import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // For navigation
import './CandidateLogin.css'; // Reusing the same CSS file
import loginImage from '../login2.jpeg'; // Same image as CandidateLogin
import NavBar from './NavBar'; // Assuming NavBar is the same

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setError('');
            } else {
                setError(data.message);
                setMessage('');
            }
        } catch (err) {
            setError('Error during password reset request');
            setMessage('');
        }
    };

    return (
        <div className="candidate-login-body">
            <NavBar />

            <div className="candidate-login-content">
                {/* Left side for image */}
                <div className="candidate-login-image-side">
                    <img src={loginImage} alt="Forgot Password" className="candidate-login-image" />
                </div>

                {/* Right side for form */}
                <div className="candidate-login-form-side">
                    <h2 className="candidate-login-text-center">Forgot Password?</h2>
                    <form className='candidate-login-form' onSubmit={handleSubmit} style={{ marginTop: '5px', padding: '20px 30px' }}>
                        <div className="mb-3">
                            <label
                                htmlFor="email"
                                className="form-label"
                                style={{ fontWeight: 'bold', color: '#061f47', marginBottom: '1px' }}
                            >
                                Email:
                            </label>
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
                        <button
                            type="submit"
                            className="candidate-login-button w-100"
                            style={{ backgroundColor: '#061f47', color: 'white', fontWeight: 'bold' }}
                        >
                            Request Password Reset
                        </button>
                        {message && (
                            <div
                                className="mt-3"
                                style={{ color: 'green', textAlign: 'center', fontWeight: 'bold' }}
                            >
                                {message}
                            </div>
                        )}
                        {error && (
                            <div
                                className="mt-3"
                                style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}
                            >
                                {error}
                            </div>
                        )}
                        {/* Back to login */}
                        <p
                            className="log"
                            style={{
                                fontWeight: 'bold',
                                textAlign: 'center',
                                marginTop: '15px',
                            }}
                        >
                            <Link to="/role-selection" style={{ color: '#061f47' }}>
                                Back to Login
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;