// src/AttendanceForm.js
import React, { useState, useEffect } from 'react';
import './AttendanceForm.css';
import { useNavigate } from 'react-router-dom';

function AttendanceForm({ teacherLoggedIn }) {
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    email: '',
  });
  const [username, setUsername] = useState(''); // Separate state for username
  const [password, setPassword] = useState(''); // Separate state for password
  const [currentTime, setCurrentTime] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
const [rno,setrno]=useState(0);
  // Update the current time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value); // Update username state
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value); // Update password state
  };

  const handleSubmit = async (e) => {
    const numericRno = parseInt(rno);
    e.preventDefault();
    document.getElementById('formblock').style.display = 'none'; // Hide form 
    try {
      const response = await fetch('http://172.16.1.70:3002/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({rno:numericRno}),
      });

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        setSubmitMessage('Attendance submitted successfully');
        setFormData({ rollNumber: '', name: '', email: '' });
        setShowLogin(true); // Show login form after success
      } else {
        setSubmitMessage('Failed to submit attendance');
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setSubmitMessage('Error submitting attendance');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    try {
      const response = await fetch('http://172.16.1.70:3003/studentLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: username, // Ensure this is correctly referencing your input
          password: password,   // Password field
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setSubmitMessage('Login successful!');
        navigate(`/StudentDashboard/${username}`); // Redirect on successful login
      } else {
        setSubmitMessage('Invalid credentials');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setSubmitMessage('Error logging in');
    }
    setShowLogin(false);
  };
  

  return (
    <div className="attendance-form-container">
      {teacherLoggedIn ? (
        <form
          className="attendance-form"
          id="formblock"
          style={{ display: 'block' }}
          onSubmit={handleSubmit}
        >
          <h2>Attendance Form</h2>
          <div className="form-group">
            <label htmlFor="rollNumber">Roll Number</label>
            <input
              type="text"
              id="rollNumber"
              name="rollNumber"
              value={rno}
              onChange={(e)=>{setrno(e.target.value)}}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label
              htmlFor="date"
              title="Attendance will be marked for this date and time"
            >
              Current Time
            </label>
            <input
              type="text"
              id="date"
              value={currentTime}
              readOnly
              className="readonly-input"
            />
          </div>
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      ) : (
        <p>Wait for access...</p>
      )}

      {submitMessage && <div className="message">{submitMessage}</div>}

      {showLogin && (
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Login... Attendance submitted</h2>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username} // Use separate username state
              onChange={handleUsernameChange} // Separate handler for username
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password} // Use separate password state
              onChange={handlePasswordChange} // Separate handler for password
              required
            />
          </div>
          <button type="submit" className="submit-button">
            Login
          </button>
        </form>
      )}
    </div>
  );
}

export default AttendanceForm;
