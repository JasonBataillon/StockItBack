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
      return res.status(400).json({ message: 'Stock already in watchlist' });
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

// Add the DELETE endpoint to remove a stock from the user's watchlist
router.delete('/:symbol', authenticate, async (req, res) => {
  const { symbol } = req.params;
  const userId = req.user.id; // Assuming you have user authentication

  try {
    // Find the stock by symbol
    const stock = await prisma.stock.findUnique({
      where: { symbol },
    });

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    // Remove the stock from the user's watchlist in the database
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
