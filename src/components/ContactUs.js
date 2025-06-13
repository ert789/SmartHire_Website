import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './NavBar';
import './ContactUs.css'; // Import the CSS file
import Footer from './Footer.js'

const ContactUs = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [responseMessage, setResponseMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/contact-us', {
                name,
                email,
                message,
            });

            if (response.status === 200) {
                setResponseMessage('Your message has been sent successfully!');
                setName('');
                setEmail('');
                setMessage('');
            } else {
                setResponseMessage('Failed to send your message. Please try again.');
            }
        } catch (error) {
            setResponseMessage('An error occurred while sending your message.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="contact-us-container">
                <h2 className="contact-us-heading">Contact Us</h2>
                <form className="contact-us-form" onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label" style={{fontWeight: 'bold', color: "#061f47", marginBottom: '0px'}}>Name:</label>
                        <input type="text" id="name" placeholder="John Doe" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label" style={{fontWeight: 'bold', color: "#061f47", marginBottom: '0px'}}>Email:</label>
                        <input type="email" id="email" placeholder="John@gmail.com" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="message" className="form-label" style={{fontWeight: 'bold', color: "#061f47"}}>Message:</label>
                        <textarea
                            id="message"
                            className="form-control"
                            rows="5"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <div className="text-center">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                    {responseMessage && (
                        <div className="alert alert-info mt-4" role="alert">
                            {responseMessage}
                        </div>
                    )}
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default ContactUs;