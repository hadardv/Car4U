const Pool = require("pg").Pool;
require("dotenv").config();
const axios = require("axios");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function getExchangeRate() {
  const apiKey = "d99f681625e992d0c362fd21";
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/EUR/ILS`;

  try {
    const response = await axios.get(url);
    if (response.data && response.data.conversion_rate) {
      console.log(
        `The exchange rate from EUR to ILS is: ${response.data.conversion_rate}`
      );
      return response.data.conversion_rate;
    } else {
      console.error("No conversion rate data found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching exchange rate:", error.message);
    return null;
  }
}

const getCars = async (filters) => {
  let query = "SELECT * FROM electric_vehicles WHERE 1=1";
  let queryParams = [];
  let paramIndex = 1;

 
  if (filters.carName) {
    query += ` AND "Car_name" ILIKE $${paramIndex++}`;
    queryParams.push(`%${filters.carName}%`);
  }
  if (filters.battery) {
    query = query + ` AND "Battery" = $${paramIndex++}`;
    queryParams.push(filters.battery);
  }
  if (filters.efficiency) {
    query += ` AND "Efficiency" = $${paramIndex++}`;
    queryParams.push(filters.efficiency);
  }
  if (filters.fastCharge) {
    query += ` AND "Fast_charge" = $${paramIndex++}`;
    queryParams.push(filters.fastCharge);
  }
  if (filters.priceDE) {
    console.log("Parsed priceDE:", parseFloat(filters.priceDE));
    query += ` AND "Price.DE." <> 'NA' AND "Price.DE."::numeric <= $${paramIndex++}`;
    queryParams.push(parseFloat(filters.priceDE));
}
  if (filters.range) {
    query += ` AND "Range" = $${paramIndex++}`;
    queryParams.push(filters.range);
  }
  if (filters.topSpeed) {
    query += ` AND "Top_speed" = $${paramIndex++}`;
    queryParams.push(filters.topSpeed);
  }
  if (filters.acceleration) {
    query += ` AND "Acceleration..0.100." = $${paramIndex}`;
    queryParams.push(filters.acceleration);
  }
  console.log("Executing SQL query:", query);
  console.log("With parameters:", queryParams);

  queryParams.forEach((param) => {
    console.log(`${param}: ${typeof param}`);
  });

  try {
    const results = await pool.query(query, queryParams);
    const rate = await getExchangeRate();

    results.rows.map((car) => {
      console.log(car);
    });
    

    return results.rows.map((car) => ({
      ...car,
      priceILS: car["Price.DE."] ? (parseFloat(car["Price.DE."]) * rate).toFixed(2) : 'N/A',
    }));
  } catch (error) {
    console.error("Error fetching cars with filters:", error);
    throw error;
  }
};

module.exports = {
  getCars,
};
