import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import lenderRoutes from './routes/lenders';
import applicationRoutes from './routes/applications';
import leadRoutes from './routes/leads';
import revenueRoutes from './routes/revenue';
import seedRoutes from './routes/seed';
import registryRoutes from './routes/registry';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'MortgageNG API is running perfectly! 🚀' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/lenders', lenderRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/registry', registryRoutes);

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mortgage-ng';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server for Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
