import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import marketRouter from './routes/market';
import aiRouter from './routes/ai';
import watchlistRouter from './routes/watchlist';
import userRouter from './routes/user';
import financeRouter from './routes/finance';
import documentsRouter from './routes/documents';
import path from 'path';
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(helmet());

// Rate Limiting (100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Serve uploaded files securely
app.use('/uploads', requireAuth(), express.static(path.join(__dirname, '../uploads')));

app.use(express.json());
app.use(clerkMiddleware());

// API Routes
app.use('/api/market', marketRouter);
app.use('/api/ai', aiRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/user', userRouter);
app.use('/api/finance', financeRouter);
app.use('/api/documents', documentsRouter);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Investment Advisor API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
