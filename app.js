const express = require('express');
const app = express();
const customers = require('./customers.json');

// List API with search and pagination
app.get('/customers', (req, res) => {
  const { first_name, last_name, city, page, limit } = req.query;
  let results = [...customers];
  
  // Filter by first_name, last_name, and city
  if (first_name) {
    results = results.filter(customer => customer.first_name.toLowerCase().includes(first_name.toLowerCase()));
  }
  if (last_name) {
    results = results.filter(customer => customer.last_name.toLowerCase().includes(last_name.toLowerCase()));
  }
  if (city) {
    results = results.filter(customer => customer.city.toLowerCase().includes(city.toLowerCase()));
  }

  console.log('resultsresults', results);
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedResults = results.slice(startIndex, endIndex);

  res.json(paginatedResults);
});

// API to get a single customer by id
app.get('/customers/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const customer = customers.find(customer => customer.id === id);

  if (!customer) {
    res.status(404).send('Customer not found');
  } else {
    res.json(customer);
  }
});

// API to list unique cities with number of customers from each city
app.get('/cities', (req, res) => {
  const cityCounts = {};

  customers.forEach(customer => {
    const city = customer.city;
    if (cityCounts[city]) {
      cityCounts[city]++;
    } else {
      cityCounts[city] = 1;
    }
  });

  res.json(cityCounts);
});

// API to add a customer with validations
app.post('/customers', (req, res) => {
  const { id, first_name, last_name, city, company } = req.body;

  // Check if all fields are present
  if (!id || !first_name || !last_name || !city || !company) {
    res.status(400).send('All fields are required');
    return;
  }

  // Check if customer already exists
  const existingCustomer = customers.find(customer => customer.id === id);
  if (existingCustomer) {
    res.status(409).send('Customer already exists');
    return;
  }

  // Check if city and company already exist
  const existingCity = customers.some(customer => customer.city === city);
  const existingCompany = customers.some(customer => customer.company === company);
  if (!existingCity || !existingCompany) {
    res.status(400).send('City and company must already exist for an existing customer');
    return;
  }

  // Add new customer
  customers.push({ id, first_name, last_name, city, company });
  res.status(201).send('Customer added successfully');
});

app.listen(3000, () => console.log('Server started on port 3000'));
