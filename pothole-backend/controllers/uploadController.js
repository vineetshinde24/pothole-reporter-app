const exifr = require('exifr');
const { predictPothole } = require('../utils/ai-predict');
const PotholeImage = require('../models/Pothole');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    console.log('🔄 Verifying image with AI model...');

    // Step 1: AI Verification
    let confidence;
    try {
      confidence = await predictPothole(req.file.buffer);
      console.log(`🤖 AI Confidence: ${confidence}`);
    } catch (aiError) {
      return res.status(500).json({ 
        message: 'AI verification service unavailable',
        error: aiError.message 
      });
    }
    
    const CONFIDENCE_THRESHOLD = 0.7;
    if (confidence < CONFIDENCE_THRESHOLD) {
      return res.status(400).json({ 
        message: 'Image rejected: AI could not confirm this is a pothole',
        confidence: confidence,
        verified: false
      });
    }

    // Step 2: Extract GPS data
    const gpsData = await exifr.gps(req.file.buffer);

    if (gpsData?.latitude && gpsData?.longitude) {
      latitude = gpsData.latitude;
      longitude = gpsData.longitude;
    } else if (req.body.latitude && req.body.longitude) {
      // Fallback to coordinates sent from frontend
      latitude = parseFloat(req.body.latitude);
      longitude = parseFloat(req.body.longitude);
    } else {
      return res.status(400).json({ message: 'No GPS data found in image' });
    }

    // Step 3: Save to database
    const imageBase64 = req.file.buffer.toString('base64');
    const imageData = `data:${req.file.mimetype};base64,${imageBase64}`;

    const potholeImage = new PotholeImage({
      image: imageData,
      latitude: latitude,
      longitude: longitude,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude] // GeoJSON: [lng, lat]
      },
      timestamp: new Date(),
      reportedBy: req.user.id,
      filename: req.file.originalname,
      ai_confidence: confidence,
      ai_verified: true,
      status: 'reported' // ✅ Add default status
    });

    await potholeImage.save();
    
    res.status(200).json({ 
      message: '✅ Image verified and uploaded successfully!', 
      potholeImage: {
        id: potholeImage._id,
        latitude: potholeImage.latitude,
        longitude: potholeImage.longitude,
        createdAt: potholeImage.createdAt,
        confidence: confidence,
        verified: true
      }
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: 'Error processing image: ' + err.message });
  }
};