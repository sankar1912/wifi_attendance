const http = require('http');
const fs = require('fs');
const path = require('path');
const socketIo = require('socket.io');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize server and Express app
const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  let extname = path.extname(filePath);
  let contentType = 'text/html';

  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
    case '.ico':
      contentType = 'image/x-icon';
      break;
    default:
      break;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(__dirname, 'public', '404.html'), (err404, content404) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content404, 'utf-8');
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.43.148:3000","http://172.16.1.39:3000","http://172.16.4.149:3000","http://172.27.192.1:3000","http://172.16.1.137:3000","http://172.16.1.70:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

let teacherLoggedIn = false;
let students = [];

// Handle new connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.emit('teacherLoginState', teacherLoggedIn);

  socket.on('submitAttendance', (formData) => {
    const currentDate = new Date().toLocaleString();
    const studentData = { ...formData, date: currentDate };
    console.log(`Received attendance from ${socket.handshake.address}:`, studentData);

    students.push(studentData);
    io.emit('newAttendance', studentData);
  });

  socket.on('teacherLogin', () => {
    teacherLoggedIn = true;
    io.emit('teacherLoginState', teacherLoggedIn);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


const fetch = require('node-fetch');

// Function to find the current period based on the time
function getCurrentPeriod() {
  const now = new Date();
  const hours = now.getHours();
  
  // Define time slots for periods
  const periods = [
    { start: 6, end: 7, period: 'period_1' },  // Period 1: 10:00 - 11:00
    { start: 10, end: 12, period: 'period_2' },  // Period 2: 11:00 - 12:00
    { start: 12, end: 14, period: 'period_3' },  // Period 3: 13:00 - 14:00
    { start: 14, end: 15, period: 'period_4' },  // Period 4: 14:00 - 15:00
    { start: 18, end: 19, period: 'period_5' }   // Period 5: 15:00 - 16:00
  ];

  // Find the active period based on the current time
  for (const { start, end, period } of periods) {
    if (hours >= start && hours < end) {
      return period;  // Return the current period (e.g., 'period_1')
    }
  }

  return null;  // Return null if no active period (i.e., outside class hours)
}

// POST endpoint to submit attendance data
app.post('/attendance', (req, res) => {
  console.log(req.body.rno);
  const student_id  = req.body.rno;
  console.log("Initial state ID:",student_id);
  // Get the current period based on time
  const currentPeriod = getCurrentPeriod();
  if (!currentPeriod) {
    return res.status(403).json({ message: 'Attendance can only be submitted during class hours.' });
  }

  // Prepare the data to send to the 3003 server
  const attendanceData = {
    student_id,
    period: currentPeriod,
    status: 'present'
  };

  // Send the data to the database server (3003)
  fetch('http://172.16.1.70:3003/update-attendance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(attendanceData),
  })
    .then(response => response.json())
    .then(responseData => {
      // Successfully updated attendance on 3003 server
      res.status(200).json({ message: 'Attendance updated successfully on the database server.', data: responseData });
    })
    .catch(error => {
      console.error('Error submitting attendance to the database server:', error);
      res.status(500).json({ message: 'Error submitting attendance.', error: error.message });
    });
});



// POST endpoint to store student data
app.post('/studentdata', (req, res) => {
  const studentData = req.body;
  students.push(studentData);
  io.emit('studentDataUpdated', students);
  res.status(200).send({ message: 'Data received', data: studentData });
});

// GET endpoint to retrieve student data
app.get('/studentdata', (req, res) => {
  res.status(200).json(students);
});

// Start Express server
const PORT_1 = 3002;
app.listen(PORT_1, '0.0.0.0', () => {
  console.log(`Endpoint running on http://localhost:${PORT_1}`);
});

// Start HTTP server for static files and Socket.IO
const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
