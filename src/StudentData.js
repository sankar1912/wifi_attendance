import React, { useState, useEffect } from 'react';
import io from 'socket.io-client'; 
import './App.css'; 

const socket = io('http://localhost:3001');

const StudentData = () => {
  const [students, setStudents] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3002/studentdata');
      const data = await response.json();
      console.log(data); // Verify data structure
      setStudents(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    socket.on('studentDataUpdated', (updatedStudents) => {
      setStudents(updatedStudents);
    });

    return () => {
      socket.off('studentDataUpdated');
    };
  }, []);

  return (
    <div className="app-container">
      <h1>Attendance Management System</h1>
      <table className="attendance-table">
        <thead>
          <tr>
            <th>Roll Number</th>
            <th>Name</th>
            <th>Email</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={index}>
              <td>{student.rollNumber}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentData;
