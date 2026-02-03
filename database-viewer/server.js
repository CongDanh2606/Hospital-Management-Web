import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============== CONNECTION 1: HOSPITAL DATABASE ==============
const hospitalConnection = mongoose.createConnection(process.env.HOSPITAL_DB, {
  serverSelectionTimeoutMS: 5000,
});

hospitalConnection.on('connected', () => {
  console.log('✅ Connected to Hospital Database');
});

hospitalConnection.on('error', (err) => {
  console.error('❌ Hospital DB Error:', err.message);
});

// Doctor Model (Hospital DB)
const doctorSchema = new mongoose.Schema({}, { strict: false, collection: 'doctors' });
const Doctor = hospitalConnection.model('Doctor', doctorSchema);

// ============== CONNECTION 2: ECOMMERCE DATABASE ==============
const ecommerceConnection = mongoose.createConnection(process.env.ECOMMERCE_DB, {
  serverSelectionTimeoutMS: 5000,
});

ecommerceConnection.on('connected', () => {
  console.log('✅ Connected to Ecommerce Database');
});

ecommerceConnection.on('error', (err) => {
  console.error('❌ Ecommerce DB Error:', err.message);
});

// Product Model (Ecommerce DB)
const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = ecommerceConnection.model('Product', productSchema);

// ============== API ROUTES ==============

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    connections: {
      hospital: hospitalConnection.readyState === 1 ? 'Connected' : 'Disconnected',
      ecommerce: ecommerceConnection.readyState === 1 ? 'Connected' : 'Disconnected',
    },
  });
});

// Get all doctors from Hospital DB
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({}).limit(100);
    res.json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message,
    });
  }
});

// Get all products from Ecommerce DB
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({}).limit(100);
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 View data at http://localhost:${PORT}\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await hospitalConnection.close();
  await ecommerceConnection.close();
  process.exit(0);
});
