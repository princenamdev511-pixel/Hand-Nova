import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>')) {
    console.warn(
      '⚠️ [MongoDB] MONGODB_URI is not configured in .env. MongoDB features (user accounts & saved drawings) will operate in offline mock mode or display setup instructions.'
    );
    return false;
  }

  if (isConnected) {
    return true;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ [MongoDB Atlas] Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.error('❌ [MongoDB Atlas] Connection failed:', err.message);
    isConnected = false;
    return false;
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
