import mongoose from 'mongoose';

const drawingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Hand Air Drawing',
      trim: true,
      maxlength: 100,
    },
    dataUrl: {
      type: String,
      required: [true, 'Drawing image data is required'],
    },
    strokeCount: {
      type: Number,
      default: 0,
    },
    gesturesUsed: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Drawing = mongoose.models.Drawing || mongoose.model('Drawing', drawingSchema);
export default Drawing;
