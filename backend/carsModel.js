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

const getPriceForStateAndSector = async (state) => {
  const query = `
    SELECT price 
    FROM us_electricity_prices 
    WHERE "stateDescription" = $1 
    AND "sectorName" = 'residential'
  `;
  const values = [state];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      return result.rows[0].price;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching price:', error);
    throw error;
  }
};

const calculateElectricityPrice = (car, avarageKm, electricityPrice) => {
  if (!electricityPrice || !car.Range || !car.Battery) return "N/A";
  const range = car.Range;
  const battery = car.Battery;
  const price = electricityPrice;
  const kmPerYear = avarageKm ? avarageKm : 15000; 

  const electricityCost = (kmPerYear * range) / (battery * price);
  return electricityCost.toFixed(2);
};

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

  try {
    const results = await pool.query(query, queryParams);
    const rate = await getExchangeRate();

    if (filters.state) {
      const electricityPrice = await getPriceForStateAndSector(filters.state);

      return results.rows.map((car) => ({
        ...car,
        priceILS: car["Price.DE."]
          ? (parseFloat(car["Price.DE."]) * rate).toFixed(2)
          : "N/A",
        electricity_price: calculateElectricityPrice(car, filters.avarageKm, electricityPrice),
      }));
    } else {
      return results.rows.map((car) => ({
        ...car,
        priceILS: car["Price.DE."]
          ? (parseFloat(car["Price.DE."]) * rate).toFixed(2)
          : "N/A",
        electricity_price: "N/A",
      }));
    }
  } catch (error) {
    console.error("Error fetching cars with filters:", error);
    throw error;
  }
};


const deleteCars = async (carNames) => {
  const query = 'DELETE FROM electric_vehicles WHERE "Car_name" = ANY($1)';
  try {
    await pool.query(query, [carNames]);
  } catch (error) {
    console.error("Error deleting cars:", error);
    throw error;
  }
};

const updateCar = async (car) => {
  const query = `
    UPDATE electric_vehicles
    SET "Battery" = $1,
        "Car_name_link" = $2,
        "Efficiency" = $3,
        "Fast_charge" = $4,
        "Price.DE." = $5,
        "Range" = $6,
        "Top_speed" = $7,
        "Acceleration..0.100." = $8
    WHERE "Car_name" = $9
  `;
  const values = [
    car.Battery,
    car.Car_name_link,
    car.Efficiency,
    car.Fast_charge,
    car["Price.DE."],
    car.Range,
    car.Top_speed,
    car["Acceleration..0.100."],
    car.Car_name,
  ];

  Object.entries(car).forEach(([key,value]) => {
    console.log(`key <<<>>> ${key} ----------- value <<<>>> ${value}`)
  })

  console.log(`\n\n ${query} \n\n`)

  try {
    await pool.query(query, values);
  } catch (error) {
    console.error("Error updating car:", error);
    throw error;
  }
};

const addCar = async (car) => {
  const query = 
  `  INSERT INTO electric_vehicles (
      "Car_name", "Battery", "Car_name_link", "Efficiency", "Fast_charge", 
      "Price.DE.", "Range", "Top_speed", "Acceleration..0.100."
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) `
    const values = [
      car.Car_name,
      car.Battery,
      car.Car_name_link,
      car.Efficiency,
      car.Fast_charge,
      car["Price.DE."],
      car.Range,
      car.Top_speed,
      car["Acceleration..0.100."]
    ];
    try {
      await pool.query(query, values);
    } catch (error) {
      console.error('Error adding car:', error);
      throw error;
    }
}

const getStates = async () => {
  const query = 'SELECT DISTINCT "stateDescription" FROM us_electricity_prices ORDER BY "stateDescription"';
  try {
    const { rows } = await pool.query(query);
    return rows.map(row => row.stateDescription);
  } catch (error) {
    console.error('Error fetching states:', error);
    throw error;
  }
};

const getFastestCar = async () => {
  const query = 'SELECT * FROM electric_vehicles ORDER BY "Top_speed" DESC LIMIT 1';
  try {
    const { rows } = await pool.query(query);
    return rows[0];
  } catch (error) {
    console.error('Error fetching fastest car:', error);
    throw error;
  }
}

const getLowestAccelerationCar = async () => {
  const query = 'SELECT * FROM electric_vehicles ORDER BY "Acceleration..0.100." ASC LIMIT 1';
  try {
    const { rows } = await pool.query(query);
    return rows[0];
  } catch (error) {
    console.error('Error fetching lowest acceleration car:', error);
    throw error;
  }
};

const getMostFastChargeCar = async () => {
  const query = `
   WITH filtered_vehicles AS (
  SELECT *
  FROM electric_vehicles
  WHERE "Fast_charge" ~ '^[0-9]+(\.[0-9]+)?$'
)
SELECT * 
FROM filtered_vehicles
WHERE "Fast_charge"::numeric = (
  SELECT MIN("Fast_charge"::numeric) 
  FROM filtered_vehicles
);
  `;
  try {
    const { rows } = await pool.query(query);
    return rows[0];
  } catch (error) {
    console.error('Error fetching most fast charge car:', error);
    throw error;
  }
};

const getMostEfficientCar = async () => {
  const query = 'SELECT * FROM electric_vehicles ORDER BY "Efficiency" DESC LIMIT 1';
  try {
    const { rows } = await pool.query(query);
    return rows[0];
  } catch (error) {
    console.error('Error fetching most efficient car:', error);
    throw error;
  }
};

const getBiggestBatteryCar = async () => {
  const query = 'SELECT * FROM electric_vehicles ORDER BY "Battery" DESC LIMIT 1';
  try {
    const { rows } = await pool.query(query);
    return rows[0];
  } catch (error) {
    console.error('Error fetching biggest battery car:', error);
    throw error;
  }
};

const getBiggestRangeCar = async () => {
  const query = 'SELECT * FROM electric_vehicles ORDER BY "Range" DESC LIMIT 1';
  try {
    const { rows } = await pool.query(query);
    return rows[0];
  } catch (error) {
    console.error('Error fetching biggest range car:', error);
    throw error;
  }
};




module.exports = {
  getCars,
  deleteCars,
  updateCar,
  addCar,
  getStates,
  getFastestCar,
  getLowestAccelerationCar,
  getMostFastChargeCar,
  getMostEfficientCar,
  getBiggestBatteryCar,
  getBiggestRangeCar,
};