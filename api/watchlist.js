const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { authenticate } = require('./auth');

router.post('/add', authenticate, async (req, res, next) => {
  const { stockTicker, stockName } = req.body;
  const userId = req.user.id;

  try {
    const stock = await prisma.stock.upsert({
      where: { symbol: stockTicker },
      update: {},
      create: {
        symbol: stockTicker,
        name: stockName, // Use the provided stock name
      },
    });

    const watchlist = await prisma.watchlist.create({
      data: {
        userId,
        stockId: stock.id,
      },
    });

    res.status(201).json(watchlist);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
