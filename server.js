require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;
const cors = require('cors');

app.use(cors());
app.use(require('morgan')('dev'));
app.use(express.json());

app.use(require('./api/auth').router);
app.use('/user', require('./api/user'));
app.use('/watchlist', require('./api/watchlist'));
app.use('/alert', require('./api/alert'));

// Middleware to log the request method and URL
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Middleware to handle 404 errors
app.use((req, res, next) => {
  next({ status: 404, message: 'Endpoint not found.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500);
  res.json(err.message ?? 'Sorry, something went wrong :(');
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
