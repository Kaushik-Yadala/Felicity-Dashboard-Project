require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const connectDB = require('./config/database');
const http = require('http');
const { Server }= require('socket.io');
const handleMessage = require('./controllers/handleMessage');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

//server intialization
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://felicity-dashboard-project-k3f5.vercel.app","http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  handleMessage(io, socket);

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

// Routes
app.use('/auth', require('./routes/authRouter'));
app.use('/profile', require('./routes/participantRouter'));
app.use('/admin', require('./routes/adminRouter'));
app.use('/organizer', require('./routes/organizerRouter'));
app.use('/', require('./routes/generalRouter'));

// Basic route for testing
// app.get('/', (req, res) => {
//   res.json({ message: 'Que Sera Sera 🙃' });
// });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT;

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));