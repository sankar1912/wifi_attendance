import { Route, Routes } from 'react-router-dom';
import './App.css';
import LandingPage from './LandingPage';
import AttendanceForm from './AttendanceForm';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import StudentData from './StudentData';
import StudentDashboard from './StudentDashboard';
import StudentLogin from './SudentLogin';

// Connect to the backend server
const socket = io('http://172.16.1.70:3001');  
const socket_1 = io('http://172.16.1.70:3003');  
function App() {
  const [teacherLoggedIn, setTeacherLoggedIn] = useState(false);
  const [studentData, setStudentData] = useState([]);
  
  useEffect(() => {
    socket.on('teacherLoginState', (isLoggedIn) => {
      setTeacherLoggedIn(isLoggedIn);
    });

    socket_1.on('newAttendance', (updatedData) => {
      setStudentData((prevData) => [...prevData, updatedData]);  // Append new data to state
    });

    return () => {
      socket.off('teacherLoginState');
      socket_1.off('newAttendance');
    };
  }, []);

  return (
    <div className="App">
      <p>Welcome to the Attendance Page</p>

      <Routes>
        <Route path="/" element={<LandingPage socket={socket} />} />
        <Route path="AttendanceForm" element={<AttendanceForm teacherLoggedIn={teacherLoggedIn} />} />
        <Route path="StudentData" element={<StudentData socket={socket} />} />
        <Route
            path="/StudentDashboard/:studentId"
            element={<StudentDashboard studentData={studentData} />}
          />
        <Route path="StudentLogin" element={<StudentLogin />}></Route>
      </Routes>
    </div>
  );
}

export default App;
