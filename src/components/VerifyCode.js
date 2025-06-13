import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './VerifyCode.css';

const VerifyCode = () => {
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const storedUserId = localStorage.getItem('user_id');
        if (!storedUserId) {
            navigate('/login');
            return;
        }

        const checkAuthStatus = async () => {
            try {
                const response = await axios.get(`/check-logout-status/${storedUserId}`);
                if (response.data.logged_out) {
                    setUserId(storedUserId);
                    startCountdown();
                } else {
                    const role = localStorage.getItem('role');
                    navigate(role === 'hr' ? '/hr-dashboard' : '/candidate-dashboard');
                }
            } catch (error) {
                setUserId(storedUserId);
                startCountdown();
            }
        };

        checkAuthStatus();
    }, [navigate]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const startCountdown = () => {
        setCountdown(30);
    };

    const handleVerify = async () => {
        if (!otp || !userId) {
            setMessage('Please enter OTP');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/verify', { 
                code: otp, 
                user_id: userId 
            });

            if (response.status === 200) {
                localStorage.setItem('trusted_device', navigator.userAgent);
                const role = localStorage.getItem('role');
                navigate(role === 'hr' ? '/hr-dashboard' : '/candidate-dashboard');
            }
        } catch (error) {
            setMessage(error.response?.data?.error || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (countdown > 0) {
            setMessage(`Please wait ${countdown} seconds before requesting a new OTP`);
            return;
        }

        setResendLoading(true);
        setMessage('');
        try {
            const response = await axios.post('http://localhost:5000/login', {
                email: localStorage.getItem('email'),
                password: 'dummy'
            }, {
                headers: {
                    'X-Resend-OTP': 'true'
                }
            });

            if (response.status === 200) {
                setMessage('New OTP sent successfully!');
                startCountdown();
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to send new OTP');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="backgroundd">
            <div className="container">
                <h2>Verify OTP</h2>
                <div className="input-group">
                    
                    <input
                        type="text"
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        maxLength="6"
                        required
                    />
                </div>
                <button className='vbutton' onClick={handleVerify} disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify'}
                </button>

                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={handleResendOTP}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#061f47',
                            textDecoration: 'underline',
                            cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                            opacity: countdown > 0 ? 0.6 : 1
                        }}
                        disabled={countdown > 0 || resendLoading}
                    >
                        {resendLoading ? 'Sending...' : countdown > 0 ? `Resend OTP (${countdown}s)` : 'Resend OTP'}
                    </button>
                </div>

                {message && (
                    <p style={{ color: message.includes('success') ? 'green' : 'red' }}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default VerifyCode;
