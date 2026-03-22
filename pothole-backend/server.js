const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET is not set in .env file');
  process.exit(1);
}
console.log('JWT_SECRET is properly configured');

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:5173',  // dev
    'http://localhost:4173',  // preview
    'https://pothole-reporter-app.onrender.com',  // render 
    'https://pothole-reporter-app-beta.vercel.app/' // vercel 

  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log("Connected to DB"))
.catch(err => console.log("Connection Failed", err));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/upload', require('./routes/upload'));
app.use('/potholes', require('./routes/potholes'));
app.use('/admin', require('./routes/admin'));

// Health check
app.get('/', (req, res) => {    
  res.send('Pothole Reporting Backend is running');
})

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));