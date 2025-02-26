require('dotenv').config();

async function fetchStockPrice(symbol) {
  const API_KEY = process.env.VITE_POLYGON_API_KEY;
  try {
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${API_KEY}`
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `API Error: ${response.status} ${response.statusText}`,
        errorText
      );
      throw new Error(
        `Network response was not ok: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    if (data && data.results && data.results.length > 0 && data.results[0].c) {
      return data.results[0].c;
    } else {
      console.error('API returned invalid data', data);
      throw new Error('API returned invalid data');
    }
  } catch (error) {
    console.error('Error fetching stock price:', error);
    return null;
  }
}

module.exports = { fetchStockPrice };
