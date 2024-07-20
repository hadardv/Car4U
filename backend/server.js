const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const carsModel = require('./carsModel');
const salesModel = require('./salesModel');
const { query } = require('express-validator');

const app = express();

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes


app.get('/api/data', (req, res) => {
  console.log("Received filters:", req.query);
  carsModel.getCars(req.query)
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {
      res.status(500).send(error);
    });
});

app.get('/api/states', (req, res) => {
  carsModel.getStates()
    .then(states => res.status(200).json(states))
    .catch(error => {
      console.error('Error fetching states:', error);
      res.status(500).send({ message: 'Error fetching states', error: error.message });
    });
});

app.delete('/api/cars', (req, res) => {
  const { cars } = req.body;
  if (!cars || cars.length === 0) {
    return res.status(400).send({ message: 'No cars specified for deletion' });
  }
  carsModel.deleteCars(cars)
    .then(() => res.status(204).send())
    .catch(error => {
      console.error('Failed to delete cars:', error);
      res.status(500).send({ message: 'Failed to delete cars', error: error.message });
    });
});

app.put('/api/cars', (req, res) => {
  const car = req.body;
  if (!car || !car.Car_name) {
    return res.status(400).send({ message: 'Car data is incomplete or missing' });
  }
  carsModel.updateCar(car)
    .then(() => res.status(204).send())
    .catch(error => {
      console.error('Failed to update car:', error);
      res.status(500).send({ message: 'Failed to update car', error: error.message });
    });
});

app.post('/api/cars',(req,res) => {
  const car = req.body;
  if (!car || !car.Car_name) {
    return res.status(400).send({ message: 'Car data is incomplete or missing' });
  }
  carsModel.addCar(car)
  .then(() => res.status(204).send())
    .catch(error => {
      console.error('Failed to add car:', error);
      res.status(500).send({ message: 'Failed to add car', error: error.message });
    });
})

app.get('/api/cars/fastest' ,(req,res) => {
  carsModel.getFastestCar()
  .then(response => res.status(200).send(response))
  .catch(error => res.status(500).send(error));
})

app.get('/api/cars/lowest-acceleration', (req, res) => {
  carsModel.getLowestAccelerationCar()
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error));
});

app.get('/api/cars/most-fast-charge', (req, res) => {
  carsModel.getMostFastChargeCar()
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error));
});

app.get('/api/cars/most-efficient', (req, res) => {
  carsModel.getMostEfficientCar()
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error));
});

app.get('/api/cars/biggest-battery', (req, res) => {
  carsModel.getBiggestBatteryCar()
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error));
});

app.get('/api/cars/biggest-range', (req, res) => {
  carsModel.getBiggestRangeCar()
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error));
});

app.get('/api/sales/total-quarterly', async (req, res) => {
  try {
    const totalSales = await salesModel.getTotalQuarterlySales();
    res.status(200).json(totalSales); 
  } catch (error) {
    res.status(500).send({ message: 'Error fetching total quarterly sales data', error: error.message });
  }
});

app.get('/api/sales/total-by-brand', async (req, res) => {
  try {
    const totalSalesByBrand = await salesModel.getTotalSalesByBrand();
    res.status(200).json(totalSalesByBrand); 
  } catch (error) {
    res.status(500).send({ message: 'Error fetching total brands sales data', error: error.message });
  }
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
