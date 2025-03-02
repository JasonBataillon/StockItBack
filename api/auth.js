require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require('../prisma');

// Function to create a JWT token
function createToken(id) {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '2h',
    algorithm: 'HS256',
  });
  return token;
}

// Middleware to authenticate requests
router.use(async (req, res, next) => {
  if (req.path === '/register') {
    // Skip authentication for registration route
    return next();
  }
  const authHeader = req.headers.authorization;
  const token = authHeader?.slice(7);
  // Extract token from authorization header
  if (!token) {
    // Skip if no token is provided
    return next();
  }
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET, {
      // Verify token using HS256 algorithm
      algorithm: 'HS256',
    });
    const user = await prisma.user.findUniqueOrThrow({ where: { id } });
    // Attach user to request object
    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// Route to register a new user
router.post('/register', async (req, res, next) => {
  const { username, password, email } = req.body;
  try {
    console.log('Registering user:', { username, email });
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: await bcrypt.hash(password, 10),
        // Initialize wallet with $5000
        wallet: 5000.0,
      },
    });
    console.log(user);
    res.status(201).json({ token: createToken(user.id) });
  } catch (e) {
    console.error('Registration error:', e);
    next(e);
  }
});

// Route to log in a user
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findFirstOrThrow({
      where: {
        username,
      },
    });
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        message: 'Username or password is incorrect. Please try again.',
      });
    }
    const token = createToken(user.id);
    res.json({ token });
  } catch (e) {
    next(e);
  }
});

// Middleware to ensure the user is authenticated
function authenticate(req, res, next) {
  if (!req.user) {
    return next({ status: 401, message: 'Please log in first.' });
  }
  next();
}

module.exports = { router, authenticate };
