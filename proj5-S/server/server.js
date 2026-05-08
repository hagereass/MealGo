require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const createCouponRoute = require('./createCoupon');

const app = express();

// CORS (Frontend Vercel)
app.use(cors({
  origin: [
    "https://meal-go-git-main-jhk442550-9902s-projects.vercel.app",
    "https://meal-go-alpha.vercel.app",
    "http://localhost:5173"
  ],
  credentials: true
}));

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