const express = require('express');
const { requireAdmin } = require('../middleware/adminAuth');
const User = require('../models/User');
const PotholeImage = require('../models/Pothole');

const router = express.Router();

// Get all users (admin only)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get all potholes with details (admin only)
router.get('/potholes', requireAdmin, async (req, res) => {
  try {
    // FIX: Use try/catch around populate separately so we can fall back
    // if reportedBy ref is missing or schema doesn't have it defined.
    let potholes;
    try {
      potholes = await PotholeImage.find()
        .populate('reportedBy', 'username email')
        .sort({ createdAt: -1 });
    } catch (populateErr) {
      console.error('Populate failed, falling back to raw query:', populateErr.message);
      // Fallback: return potholes without populated user data
      potholes = await PotholeImage.find().sort({ createdAt: -1 });
    }
    res.json(potholes);
  } catch (err) {
    console.error('Error fetching potholes:', err);
    res.status(500).json({ message: 'Error fetching potholes', detail: err.message });
  }
});

// Delete pothole (admin only)
router.delete('/potholes/:id', requireAdmin, async (req, res) => {
  try {
    const pothole = await PotholeImage.findByIdAndDelete(req.params.id);
    if (!pothole) {
      return res.status(404).json({ message: 'Pothole not found' });
    }
    res.json({ message: 'Pothole deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting pothole' });
  }
});

// Promote user to admin
router.patch('/users/:id/promote', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User promoted to admin', user });
  } catch (err) {
    res.status(500).json({ message: 'Error promoting user' });
  }
});

// Demote admin to user
router.patch('/users/:id/demote', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'user' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Admin demoted to user', user });
  } catch (err) {
    res.status(500).json({ message: 'Error demoting user' });
  }
});

// Get dashboard stats (admin only)
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalPotholes = await PotholeImage.countDocuments();
    const verifiedPotholes = await PotholeImage.countDocuments({ ai_verified: true });

    res.json({
      totalUsers,
      totalAdmins,
      totalPotholes,
      verifiedPotholes,
      verificationRate:
        totalPotholes > 0
          ? ((verifiedPotholes / totalPotholes) * 100).toFixed(1)
          : 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Delete user and all their data (HARD DELETE)
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const [deletedUser, deletedPotholes] = await Promise.all([
      User.findByIdAndDelete(userId),
      PotholeImage.deleteMany({ reportedBy: userId }),
    ]);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User and their potholes permanently deleted',
      deletedPotholesCount: deletedPotholes.deletedCount,
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// FIX: bulk-status MUST come before /:id/status
// Otherwise Express matches 'bulk-status' as the :id parameter and
// tries to find a pothole with id="bulk-status", which crashes.
router.patch('/potholes/bulk-status', requireAdmin, async (req, res) => {
  try {
    const { potholeIds, status, resolutionNotes } = req.body;

    const updateData = {
      status,
      resolvedAt: status === 'resolved' ? new Date() : null,
      resolvedBy: req.user.id,
    };

    if (resolutionNotes) {
      updateData.resolutionNotes = resolutionNotes;
    }

    const result = await PotholeImage.updateMany(
      { _id: { $in: potholeIds } },
      updateData
    );

    res.json({
      message: `Updated ${result.modifiedCount} potholes to ${status}`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error('Error bulk updating pothole status:', err);
    res.status(500).json({ message: 'Error updating potholes status' });
  }
});

// Update pothole status — keep AFTER bulk-status
router.patch('/potholes/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;

    const updateData = {
      status,
      resolvedAt: status === 'resolved' ? new Date() : null,
      resolvedBy: req.user.id,
    };

    if (resolutionNotes) {
      updateData.resolutionNotes = resolutionNotes;
    }

    const pothole = await PotholeImage.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('reportedBy', 'username email');

    if (!pothole) {
      return res.status(404).json({ message: 'Pothole not found' });
    }

    res.json({
      message: `Pothole status updated to ${status}`,
      pothole,
    });
  } catch (err) {
    console.error('Error updating pothole status:', err);
    res.status(500).json({ message: 'Error updating pothole status' });
  }
});

module.exports = router;