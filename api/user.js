const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { authenticate } = require('./auth');
const { fetchStockPrice } = require('../api/stockUtils');

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
      include: {
        watchlists: { include: { stock: true } },
        ownedStocks: { include: { stock: true } },
      },
    });
    if (user) {
      res.json({
        username: user.username,
        wallet: user.wallet,
        watchlists: user.watchlists,
        ownedStocks: user.ownedStocks,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (e) {
    next(e);
  }
});

router.post('/buy', authenticate, async (req, res, next) => {
  const { id } = req.user;
  const { stockData, amount: amountString } = req.body;
  console.log(`Incoming request to /buy endpoint`);
  console.log(`User ID: ${id}`);
  console.log(`Request body:`, req.body);
  console.log(
    `Buying stock: ${stockData.stockName}, amount: ${amountString}, price: ${stockData.stockPrice}`
  );

  try {
    if (
      !stockData ||
      stockData.stockPrice === undefined ||
      stockData.symbol === undefined
    ) {
      return res.status(400).json({ message: 'Invalid stock data' });
    }

    const symbol = stockData.symbol;
    const cost = stockData.stockPrice * parseInt(amountString, 10);
    const amount = parseInt(amountString, 10);

    if (isNaN(amount)) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await prisma.user.findUnique({ where: { id: String(id) } });

    if (user.wallet < cost) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: String(id) },
      data: { wallet: { decrement: cost } },
    });

    let stock = await prisma.stock.findUnique({
      where: { symbol: stockData.symbol },
    });

    if (!stock) {
      stock = await prisma.stock.create({
        data: {
          symbol: stockData.symbol,
          name: stockData.stockName,
          price: stockData.stockPrice,
          marketCap: stockData.marketCap || 0,
        },
      });
    }

    const existingOwnedStock = await prisma.ownedStock.findUnique({
      where: {
        userId_stockId: {
          userId: id,
          stockId: stock.id,
        },
      },
    });

    const avgPrice = existingOwnedStock
      ? (existingOwnedStock.avgPrice * existingOwnedStock.shares +
          stockData.stockPrice * amount) /
        (existingOwnedStock.shares + amount)
      : stockData.stockPrice;

    const ownedStock = await prisma.ownedStock.upsert({
      where: {
        userId_stockId: {
          userId: id,
          stockId: stock.id,
        },
      },
      update: {
        shares: { increment: amount },
        avgPrice: { set: stockData.stockPrice },
      },
      create: {
        userId: id,
        stockId: stock.id,
        shares: amount,
        avgPrice: stockData.stockPrice,
      },
    });

    res.json({ user: updatedUser, ownedStock });
  } catch (e) {
    console.error(`Error in /buy endpoint: ${e.message}`);
    next(e);
  }
});

router.post('/sell', authenticate, async (req, res, next) => {
  const { id } = req.user;
  const { symbol, amount: amountString } = req.body;
  try {
    const stockPrice = await fetchStockPrice(symbol);
    if (stockPrice === null) {
      return res
        .status(500)
        .json({ message: 'could not retrieve stock price' });
    }
    const amount = parseInt(amountString, 10);
    if (isNaN(amount)) {
      return res.status(400).json({ message: 'invalid amount' });
    }

    const revenue = stockPrice * amount;

    const user = await prisma.user.update({
      where: { id: String(id) },
      data: { wallet: { increment: revenue } },
    });

    const stock = await prisma.stock.findUnique({
      where: { symbol },
    });

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    const ownedStock = await prisma.ownedStock.findUnique({
      where: {
        userId_stockId: {
          userId: id,
          stockId: stock.id,
        },
      },
    });

    if (!ownedStock || ownedStock.shares < amount) {
      return res.status(400).json({ message: 'Not enough shares to sell' });
    }

    const remainingShares = ownedStock.shares - amount; // Calculate remaining shares

    if (remainingShares > 0) {
      await prisma.ownedStock.update({
        where: {
          userId_stockId: {
            userId: id,
            stockId: stock.id,
          },
        },
        data: {
          shares: { decrement: amount },
        },
      });
    } else {
      // Delete the ownedStock record if remaining shares are zero
      await prisma.ownedStock.delete({
        where: {
          userId_stockId: {
            userId: id,
            stockId: stock.id,
          },
        },
      });
    }

    res.json(user);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
