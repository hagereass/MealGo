require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const createCouponRoute = require('./createCoupon');

const app = express();

// CORS configuration - allow Vercel domains (including preview) and localhost
const corsOriginMatcher = (origin, callback) => {
  const LOCALHOST_ORIGINS = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];
  
  if (!origin || LOCALHOST_ORIGINS.includes(origin)) {
    return callback(null, true);
  }
  
  if (origin && origin.match(/^https:\/\/.*\.vercel\.app$/i)) {
    return callback(null, true);
  }
  
  callback(new Error('CORS not allowed'));
};

app.use(cors({
  origin: corsOriginMatcher,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors({ origin: corsOriginMatcher }));

app.use(express.json());
app.use(bodyParser.json());

// Routes
app.use('/api/admin', createCouponRoute);
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running'
  });
});
// PORT (مهم ل Railway)
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MealGo API server running on port ${PORT}`);
});