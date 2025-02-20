const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { authenticate } = require('./auth');

router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (e) {
    next(e);
  }
});

router.get('/watchlist', authenticate, async (req, res, next) => {
  const { id } = req.user;
  try {
    console.log('id:', id);
    const user = await prisma.user.findUnique({
      where: { id: String(id) },
      include: { watchlists: { include: { stock: true } } },
    });
    if (user) {
      res.json({ username: user.username, watchlists: user.watchlists });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.user;
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
