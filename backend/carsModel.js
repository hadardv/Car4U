const Pool = require('pg').Pool
require('dotenv').config();
const axios = require('axios');


const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function getExchangeRate() {
  try {
    const response = await axios.get('http://api.exchangeratesapi.io/latest', {
      params: {
          base: 'EUR',
          symbols: 'ILS',
          access_key: '94793fbba8b0642f83a121d840fa701a'
      }
  });
      return response.data.rates.ILS;
  } catch (error) {
    console.error('Error fetching exchange rate:', error.response || error.message);
      return 1; 
  }
}

const getCars = async () => {
  try {
    // First, fetch the exchange rate
    const rate = await getExchangeRate();

    // Now fetch the cars from the database
    return await new Promise((resolve, reject) => {
      pool.query("SELECT * FROM electric_vehicles", (error, results) => {
        if (error) {
          reject(error);
        }
        if (results && results.rows) {
          const updatedCars = results.rows.map(car => {
            // Ensure price exists and is not null or undefined
            if (car["Price.DE."] && typeof car["Price.DE."] === 'string') {
              // Sanitize and convert price from string to float
              const priceEUR = parseFloat(car["Price.DE."].replace(/,/g, ''));
              const priceILS = priceEUR * rate; // Convert price to ILS using the fetched rate
              return { ...car, priceILS: priceILS.toFixed(2) }; // Formatting to two decimal places
            } else {
              // Handle cars with no price or undefined price
              return { ...car, priceILS: 'N/A' }; // Or set a default value or error message
            }
          });
          resolve(updatedCars);
        } else {
          reject(new Error("No results found"));
        }
      });
    });
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error");
  }
};

module.exports = {
  getCars
};