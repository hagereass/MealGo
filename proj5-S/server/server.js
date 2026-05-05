require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: "https://meal-go-alpha.vercel.app",
  credentials: true
}));

app.use(express.json());
const bodyParser = require('body-parser');

const createCouponRoute = require('./createCoupon');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/admin', createCouponRoute);

// 👇 مهم جدًا
const PORT = process.env.PORT || 4000;

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MealGo API server running on port ${PORT}`);
});