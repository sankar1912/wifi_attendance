const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql2');
const bcrypt = require('bcrypt'); // For secure password handling
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize Express app and middlewares
const app = express();
app.use(bodyParser.json());
app.use(cors());

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'snk1912',
  database: '22bit054',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the MySQL database.');
  }
});

// Teacher Login API
app.post('/login', (req, res) => {
  const { userID, password } = req.body;

  const query = 'SELECT * FROM teachers WHERE userID = ?';
  db.query(query, [userID], (err, results) => {
    if (err) {
      console.error('Error fetching teacher data:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid userID or password' });
    }

    const teacher = results[0];

    if (password === teacher.password) {
      return res.status(200).json({ message: 'Login successful', userID });
    } else {
      return res.status(400).json({ message: 'Invalid userID or password' });
    }
  });
});

// Student Login API without bcrypt
app.post('/studentLogin', (req, res) => {
    const { studentId, password } = req.body; // Destructure studentId and password from request body
  
    console.log("Received student ID:", studentId); // Log the received student ID
    console.log("Received password:", password);     // Log the received password
  
    // Query to fetch student data by student_id
    const query = 'SELECT * FROM attendance WHERE student_id = ?';
    db.query(query, [studentId], (err, results) => {
      if (err) {
        console.error('Error fetching student data:', err);
        
        return res.status(500).json({ message: 'Internal server error' });
      }
  
     
      // Check if the student ID exists in the database
      else if (results.length > 0) {
        console.log("Query Results:", results); // Log results for debugging
        console.log("Result length:",results.length);
        
        return res.status(200).json(results);
      }
       else {
        console.log("Result length:",results.length);
        return res.status(400).json({ message: 'Invalid student ID' });
      }
    });
  });
  
 // POST endpoint to update attendance in the MySQL database
app.post('/update-attendance', (req, res) => {
    const { student_id, period, status } = req.body;
    console.log('Request Body:', req.body);
  
    // Prepare the query to update the attendance for the specified period
    const query = `
      UPDATE attendance 
      SET ${period} = 'present' 
      WHERE student_id = ${student_id}`;
  
    // Execute the query to update the attendance
    db.query(query, [student_id], (err, result) => {
        console.log(query);
      if (err) {
        console.error('Error updating attendance in the database:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Attendance record not found for this student.' });
      }
  
      // Success: attendance updated
      return res.status(200).json({ message: 'Attendance updated successfully for the current period.' });
    });
  });
  
// Attendance API: Retrieve Attendance by Student ID with Student Data
app.get('/attendance/:studentId', (req, res) => {
    const { studentId } = req.params;

    // Assuming the attendance table has a foreign key student_id referring to students.id
    const query = `
      SELECT a.*, s.name, s.department, s.email
      FROM attendance AS a
      JOIN studentsdata AS s ON a.student_id = s.id
      WHERE s.id = ${studentId}
      ORDER BY a.date DESC`;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error retrieving attendance data:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      console.log("Combined Student and Attendance Data:", results);
      res.status(200).json(results);
    });
  });
  

// Attendance Submission (POST)
app.post('/attendance', (req, res) => {
  const { student_id, date, status } = req.body;

  const query = 'INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)';
  db.query(query, [student_id, date, status], (err) => {
    if (err) {
      console.error('Error recording attendance:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    res.status(200).json({ message: 'Attendance recorded successfully' });
  });
});

// Initialize Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.43.148:3000","http://172.16.1.39:3000","http://172.16.4.149:3000","http://172.27.192.1:3000","http://172.16.3.230:3000","http://172.16.1.70:3000"],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
app.use(cors({
    origin: '*', // Or specify the mobile device's IP if needed
  }));
  

// Start the Server
const PORT = process.env.PORT || 3003;
server.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
