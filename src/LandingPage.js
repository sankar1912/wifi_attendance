import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';  // Import the custom CSS for styling

const LandingPage = ({ socket }) => {
  const [role, setRole] = useState('');
  const [userID, setUserID] = useState('');  // Added userID for teacher
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');  // For displaying login errors
  const navigate = useNavigate();

  // Handle role selection for student or teacher
  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);

    if (selectedRole === 'student') {
      socket.emit('roleSelected', 'student');
      navigate('/AttendanceForm');  // Navigate student to attendance form
    }
  };

  // Handle teacher login with userID and password
  const handleTeacherLogin = async () => {
    try {
      // Add a simple check for userID and password
      if (!userID || !password) {
        setErrorMessage('Please enter both userID and password.');
        return;
      }

      // Assuming there's a backend API to verify the userID and password
      const response = await fetch('http://localhost:3003/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID, password }),  // Send userID and password for validation
      });

      const data = await response.json();

      if (response.ok) {
        // Notify the server that the teacher has logged in
        socket.emit('teacherLogin');
        navigate('/StudentData');  // Teacher can view student data
      } else {
        setErrorMessage(data.message || 'Invalid userID or password');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Something went wrong, please try again.');
    }
  };

  return (
    <div className="landing-container">
      <div className="card">
        <h2>Select Your Role</h2>
        <div className="role-selection">
          <button className="role-button" onClick={() => handleRoleSelection('teacher')}>
            Teacher
          </button>
          <button className="role-button" onClick={() => handleRoleSelection('student')}>
            Student
          </button>
        </div>

        {role === 'teacher' && (
          <div className="login-form">
            <input
              type="text"
              value={userID}
              placeholder="Enter userID"
              onChange={(e) => setUserID(e.target.value)}
              className="input-field"
            />
            <input
              type="password"
              value={password}
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
            <button className="submit-button" onClick={handleTeacherLogin}>
              Login as Teacher
            </button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
