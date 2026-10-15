import express from 'express';
import Drawing from '../Drawing.js';
import { authMiddleware } from '../middleware/auth.js';
import { isDbConnected } from '../config/db.js';

const router = express.Router();
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB Atlas is not connected yet.',
      });
    }

    const drawings = await Drawing.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({
      success: true,
      drawings,
    });
  } catch (err) {
    console.error('Error fetching drawings:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve drawings.',
      error: err.message,
    });
  }
});
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB Atlas is not connected yet. Please set MONGODB_URI in your .env file.',
      });
    }

    const { title, dataUrl, strokeCount, gesturesUsed } = req.body;

    if (!dataUrl) {
      return res.status(400).json({
        success: false,
        message: 'Canvas image data is required.',
      });
    }

    const newDrawing = new Drawing({
      userId: req.user.id,
      title: title || `Hand Art #${Math.floor(Math.random() * 9000 + 1000)}`,
      dataUrl,
      strokeCount: strokeCount || 0,
      gesturesUsed: Array.isArray(gesturesUsed) ? gesturesUsed : [],
    });

    await newDrawing.save();

    return res.status(201).json({
      success: true,
      message: 'Drawing saved successfully to your cloud account!',
      drawing: newDrawing,
    });
  } catch (err) {
    console.error('Error saving drawing:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to save drawing.',
      error: err.message,
    });
  }
});
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB Atlas is not connected yet.',
      });
    }

    const drawing = await Drawing.findById(req.params.id);

    if (!drawing) {
      return res.status(404).json({
        success: false,
        message: 'Drawing not found.',
      });
    }
    if (drawing.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only delete your own drawings.',
      });
    }

    await Drawing.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Drawing deleted successfully.',
    });
  } catch (err) {
    console.error('Error deleting drawing:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete drawing.',
      error: err.message,
    });
  }
});

export default router;
