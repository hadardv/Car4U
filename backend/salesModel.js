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

const getTotalQuarterlySales = async () => {
  try {
    const query = `
      SELECT 
        q1_2022,
        q2_2022,
        q3_2022,
        q4_2022,
        q1_2023,
        q2_2023,
        q3_2023,
        q4_2023,
        q1_2024,
        q2_2024
      FROM ev_sales
      WHERE automaker LIKE 'TOTAL%';
    `;
    const result = await pool.query(query);
    console.log("results >>>>>> " + result.rows[0])
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching total quarterly sales data:', error);
    throw error;
  }
};

const getTotalSalesByBrand = async () => {
  try {
    const query = `
      SELECT automaker,
             SUM(q1_2022 + q2_2022 + q3_2022 + q4_2022 + 
                 q1_2023 + q2_2023 + q3_2023 + q4_2023 + 
                 q1_2024 + q2_2024) AS total_sales
      FROM ev_sales
      WHERE automaker != 'TOTAL'
      GROUP BY automaker
      ORDER BY total_sales DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching total sales by brand:', error);
    throw error;
  }
};


module.exports = {
  getTotalQuarterlySales,
  getTotalSalesByBrand,

};
