const exifr = require('exifr');
const { predictPothole, predictSeverity } = require('../utils/ai-predict');
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

    // Step 2: Severity Analysis (only runs if verification passed)
    let severity = 'unknown';
    let severityConfidence = 0;
    try {
      const severityResult = await predictSeverity(req.file.buffer);
      severity = severityResult.severity;
      severityConfidence = severityResult.severity_confidence;
      console.log(`⚠️ Severity: ${severity} (${(severityConfidence * 100).toFixed(1)}%)`);
    } catch (severityError) {
      // Don't fail the upload if severity fails — just log it
      console.error('⚠️ Severity analysis failed (non-critical):', severityError.message);
    }

    // Step 3: Extract GPS data
    const gpsData = await exifr.gps(req.file.buffer);
    if (!gpsData?.latitude || !gpsData?.longitude) {
      return res.status(400).json({ message: 'No GPS data found in image' });
    }

    // Step 4: Save to database
    const imageBase64 = req.file.buffer.toString('base64');
    const imageData = `data:${req.file.mimetype};base64,${imageBase64}`;

    const potholeImage = new PotholeImage({
      image: imageData,
      latitude: gpsData.latitude,
      longitude: gpsData.longitude,
      location: {
        type: 'Point',
        coordinates: [gpsData.longitude, gpsData.latitude]
      },
      timestamp: new Date(),
      reportedBy: req.user.id,
      filename: req.file.originalname,
      ai_confidence: confidence,
      ai_verified: true,
      severity: severity,                     // ✅ new field
      severity_confidence: severityConfidence, // ✅ new field
      status: 'reported'
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
        verified: true,
        severity: severity,                       // ✅ returned to frontend
        severity_confidence: severityConfidence   // ✅ returned to frontend
      }
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: 'Error processing image: ' + err.message });
  }
};