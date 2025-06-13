import React, { useState } from 'react';
import axios from 'axios';
import bcrypt from 'bcryptjs'; // Import bcryptjs for hashing

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault(); 

    // Hash the password before sending it to the backend
    const hashedPassword = bcrypt.hashSync(password, 10); // 10 is the salt rounds

    try {
      const response = await axios.post('http://127.0.0.1:5000/signup', {
        username,
        email,
        password: hashedPassword, // Send hashed password
      });

      if (response.status === 201) {
        setMessage('User registered successfully!');
      }
    } catch (error) {
      setMessage('Server error');
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Signup</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default Signup;
