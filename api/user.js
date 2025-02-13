const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { authenticate } = require('./auth');

router.post('/add', authenticate, async (req, res, next) => {
  const { stockTicker } = req.body;
  const userId = req.user.id;

  try {
    const stock = await prisma.stock.upsert({
      where: { symbol: stockTicker },
      update: {},
      create: { symbol: stockTicker },
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

router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: +id },
      include: { playlists: true, include: { tracks: true } },
    });
    if (user) {
      res.json(user);
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
