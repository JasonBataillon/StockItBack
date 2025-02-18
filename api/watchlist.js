const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { authenticate } = require('./auth');

router.post('/add', authenticate, async (req, res, next) => {
  const { stockTicker, stockName, stockPrice, marketCap } = req.body;
  const userId = req.user.id;
  console.log('stockTicker:', stockTicker);
  console.log('stockName:', stockName);
  console.log('stockPrice:', stockPrice);
  console.log('marketCap:', marketCap);
  try {
    const stock = await prisma.stock.upsert({
      where: { symbol: stockTicker },
      update: {},
      create: {
        symbol: stockTicker,
        name: stockName, // Use the provided stock name
        price: stockPrice,
        marketCap: marketCap || 0,
      },
    });
    console.log('stock:', stock);

    const existingWatchlist = await prisma.watchlist.findFirst({
      where: {
        userId: userId,
        stockId: stock.id,
      },
    });

    if (existingWatchlist) {
      console.log(`Watchlist already contains this stock: ${stockTicker}`);
      return res.status(400).json(existingWatchlist);
    }

    const watchlist = await prisma.watchlist.create({
      data: {
        userId,
        stockId: stock.id,
      },
    });
    console.log('watchlist:', watchlist);
    res.status(201).json(watchlist);
  } catch (error) {
    console.error('Error adding stock to watchlist:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
