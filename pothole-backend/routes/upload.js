const express = require('express');
const multer = require('multer');
const { predictPothole } = require('../utils/ai-predict');
const { uploadImage } = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Upload with AI verification
router.post('/', authenticateToken, upload.single('file'), uploadImage);

module.exports = router;