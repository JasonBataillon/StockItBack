require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;
const cors = require('cors');

// app.use(cors({ origin: 'https://stockitback.onrender.com' }));
app.use(cors());
app.use(require('morgan')('dev'));
app.use(express.json());

app.use(require('./api/auth').router);
app.use('/user', require('./api/user'));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// 404
app.use((req, res, next) => {
  next({ status: 404, message: 'Endpoint not found.' });
});

// Error-handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500);
  res.json(err.message ?? 'Sorry, something went wrong :(');
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
