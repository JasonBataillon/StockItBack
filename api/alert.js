const express = require("express");
const app = express();
const router = express.Router();

router.use(express.json());

let stockData = {
  name: "AAPL",
  currentPrice: 100,
  previousPrice: 95,
};

router.get("/api/stock", (req, res) => {
  res.json(stockData);
});

router.post("/api/stock", (req, res) => {
  const { name, currentPrice, previousPrice } = req.body;
  stockData = { name, currentPrice, previousPrice };
  res.json(stockData);
});

module.exports = router;
