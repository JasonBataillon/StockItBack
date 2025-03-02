const express = require('express');
const router = express.Router();

// Middleware to parse JSON request bodies
router.use(express.json());

// Initial stock data
let stockData = {
  name: 'AAPL',
  currentPrice: 100,
  previousPrice: 95,
};

// Route to get the current stock data
router.get('/api/stock', (req, res) => {
  // Respond with the current stock data
  res.json(stockData);
});

// Route to update the stock data
router.post('/api/stock', (req, res) => {
  const { name, currentPrice, previousPrice } = req.body;
  // Update the stock data
  stockData = { name, currentPrice, previousPrice };
  // Respond with the updated stock data
  res.json(stockData);
});

module.exports = router;
