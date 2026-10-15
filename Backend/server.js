import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB, isDbConnected } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import drawingRoutes from './routes/drawingRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    database: isDbConnected() ? 'connected' : 'disconnected',
  });
});

app.get('/', (req, res) => {
  res.send('Hand Capture Studio API');
});

app.use('/api/auth', authRoutes);
app.use('/api/drawings', drawingRoutes);

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
