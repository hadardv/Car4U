# Electric Vehicle Sales Dashboard

## Overview
The Electric Vehicle Sales Dashboard is a web application that provides insights into electric vehicle sales data. The application displays various charts, including a pie chart showing the market share of different automakers and a bar chart displaying quarterly sales data. The application uses a PostgreSQL database to store and retrieve data.

## Features
- **Pie Chart**: Visualizes the market share of different automakers.
- **Bar Chart**: Displays quarterly sales data for each automaker.
- **Data Filtering**: Allows users to filter cars based on various criteria like battery size, efficiency, and more.
- **Real-Time Data Fetching**: Retrieves data from the backend in real-time to keep the charts updated.
- **Responsive Design**: Ensures the application looks good on all devices.

## Technologies Used
- **Frontend**: React, Material UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Charts**: @mui/x-charts

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ev-sales-dashboard.git
   cd ev-sales-dashboard
2. Install the backend dependencies:
   cd backend
   npm install
3. Install the frontend dependencies:
   cd ../frontend
   npm install
4.  Set up the PostgreSQL database:

Create a database named ev_dashboard.
Import the provided SQL schema and data.

5. Configure environment variables:

Create a .env file in the backend directory with the following variables:
DB_USER=your_db_username
DB_HOST=your_db_host
DB_DATABASE=ev_sales_dashboard
DB_PASSWORD=your_db_password
DB_PORT=your_db_port

Running the Application:
1. start the backend server:
   cd backend
   npm run dev
2. start the frontend server
   cd frontend
   npm start
Open your browser and navigate to http://localhost:3000.

API Endpoints
GET /api/cars: Fetches filtered car data.
GET /api/states: Retrieves a list of states for filtering.
GET /api/sales/quarterly: Retrieves quarterly sales data for the bar chart.
GET /api/sales/total-by-brand: Retrieves total sales data for the pie chart.



