const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const carsModel = require('./carsModel');

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

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
