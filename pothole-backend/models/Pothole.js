const mongoose = require('mongoose');

const potholeImageSchema = new mongoose.Schema({
  image: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  timestamp: { type: Date, required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String },
  ai_confidence: { type: Number },
  ai_verified: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['reported', 'under_review', 'in_progress', 'resolved', 'rejected'],
    default: 'reported'
  },
  severity: { type: String, enum: ['severe', 'non_severe', 'unknown'], default: 'unknown' },
  severity_confidence: { type: Number, default: 0 },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolutionNotes: { type: String }
}, { timestamps: true });

// Create 2dsphere index for geospatial queries
potholeImageSchema.index({ location: '2dsphere' });

const PotholeImage = mongoose.model('PotholeImage', potholeImageSchema);

module.exports = PotholeImage;