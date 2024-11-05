import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentLogin = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3003/studentLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, password }),  // Send studentId and password for validation
      });

      const data = await response.json();
      if (response.ok) {
        // Upon successful login, navigate to the StudentDashboard, passing the studentId
        navigate(`/StudentDashboard/${studentId}`);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Something went wrong, please try again.');
    }
  };

  return (
    <div>
      <h2>Student Login</h2>
      <input
        type="text"
        placeholder="Enter Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      />
      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

export default StudentLogin;
