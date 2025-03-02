const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { authenticate } = require('./auth');

// Route to add a stock to the user's watchlist
router.post('/add', authenticate, async (req, res, next) => {
  const { stockTicker, stockName, stockPrice, marketCap } = req.body;
  const userId = req.user.id;
  try {
    // Upsert the stock in the database
    const stock = await prisma.stock.upsert({
      where: { symbol: stockTicker },
      update: {},
      create: {
        symbol: stockTicker,
        name: stockName,
        price: stockPrice,
        marketCap: marketCap || 0,
      },
    });

    // Check if the stock is already in the user's watchlist
    const existingWatchlist = await prisma.watchlist.findFirst({
      where: {
        userId: userId,
        stockId: stock.id,
      },
    });

    if (existingWatchlist) {
      return res.status(400).json({ message: 'Stock already in watchlist' });
    }

    // Add the stock to the user's watchlist
    const watchlist = await prisma.watchlist.create({
      data: {
        userId,
        stockId: stock.id,
      },
    });
    res.status(201).json(watchlist);
  } catch (error) {
    console.error('Error adding stock to watchlist:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to remove a stock from the user's watchlist
router.delete('/:symbol', authenticate, async (req, res) => {
  const { symbol } = req.params;
  const userId = req.user.id;

  try {
    // Find the stock in the database
    const stock = await prisma.stock.findUnique({
      where: { symbol },
    });

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    // Remove the stock from the user's watchlist
    await prisma.watchlist.deleteMany({
      where: {
        userId: userId,
        stockId: stock.id,
      },
    });

    res.status(200).json({ message: 'Stock removed from watchlist' });
  } catch (error) {
    console.error('Error removing stock from watchlist:', error);
    res.status(500).json({ message: 'Error removing stock from watchlist' });
  }
});

module.exports = router;
