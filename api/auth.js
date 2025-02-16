require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require('../prisma');

function createToken(id) {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '2h',
    algorithm: 'HS256',
  });
  return token;
}

router.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.slice(7);
  if (!token) {
    return next();
  }
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET, {
      algorithm: 'HS256',
    });
    const user = await prisma.user.findUniqueOrThrow({ where: { id } });
    req.user = user;
    next();
  } catch (e) {
    next(e);
    res.status(401).json({ message: 'Unauthorized' });
  }
});

router.post('/register', async (req, res, next) => {
  const { username, password, email } = req.body;
  try {
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: await bcrypt.hash(password, 10),
      },
    });
    console.log(user);
    res.status(201).json({ token: createToken(user.id) });
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findFirstOrThrow({
      where: {
        username,
      },
    });
    const match = bcrypt.compare(password, user.password);
    if (!match) {
      return next({ status: 401, message: 'Invalid login.' });
    }
    const token = createToken(user.id);
    res.json({ token });
  } catch (e) {
    next(e);
  }
});

function authenticate(req, res, next) {
  if (!req.user) {
    return next({ status: 401, message: 'Please log in first.' });
  }
  next();
}

module.exports = { router, authenticate };

bcrypt.genSalt;
