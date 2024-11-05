import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './StudentDashboard.css'; // Import the CSS file for styles

const StudentDashboard = ({StudentData}) => {
  const { studentId } = useParams();
  const [attendanceData, setAttendanceData] = useState([]);
  const [studentInfo, setStudentInfo] = useState({});

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch(`http://172.16.1.70:3003/attendance/${studentId}`);
        const data = await response.json();
        setAttendanceData(data);

        // Get student info from the first attendance record
        if (data.length > 0) {
          const { name, department, email } = data[0];
          setStudentInfo({ name, department, email });
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    fetchAttendance();
  }, [studentId]);

  return (
    <div className="dashboard">
      <h1>Welcome, {studentInfo.name || 'Student'}</h1>
      {studentInfo && (
        <div className="student-info">
          <p><strong>Department:</strong> {studentInfo.department}</p>
          <p><strong>Email:</strong> {studentInfo.email}</p>
        </div>
      )}
      <h2>Your Attendance Records</h2>
      {attendanceData.length === 0 ? (
        <p>No attendance records available.</p>
      ) : (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Period 1</th>
              <th>Period 2</th>
              <th>Period 3</th>
              <th>Period 4</th>
              <th>Period 5</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((record, index) => (
              <tr key={index}>
                <td>{record.date}</td>
                <td>{record.day}</td>
                {['period_1', 'period_2', 'period_3', 'period_4', 'period_5'].map((period, idx) => (
                  <td key={idx}>
                    <div className={`attendance-status ${record[period]}`}>
                      {record[period] === 'absent' ? 'Absent' : 'Present'}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentDashboard;
