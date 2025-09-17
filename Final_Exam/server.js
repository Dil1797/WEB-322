// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const exphbs = require('express-handlebars');

// Create an Express app
const app = express();
const port = 3000;

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Set the views folder
app.set('views', path.join(__dirname, 'views'));  // Ensure views directory is correctly set

// Setup Handlebars as the templating engine
const hbs = exphbs.create({
  extname: 'hbs',  // Ensure the extension is .hbs
  defaultLayout: null,  // Disable layouts since we only have one view file
  allowProtoPropertiesByDefault: true, // Allow access to prototype properties (optional)
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// MongoDB URI
const mongoURI = "mongodb+srv://george_tsang:At00las%24@mongodbatlas-gua4x.mongodb.net/mongodatabase?retryWrites=true";

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Define the Car schema and model
const carSchema = new mongoose.Schema({
  brand: String,
  country: String,
  sold: Number,
});

const Car = mongoose.model('Car', carSchema);

// Middleware to parse form data (for POST requests)
app.use(express.urlencoded({ extended: true }));

// Home route to fetch all countries and display them
app.get('/', async (req, res) => {
  try {
    // Fetch unique countries from the database
    const countries = await Car.distinct('country');

    // Sort and reverse the countries array AFTER fetching the results
    countries.sort().reverse();

    // Store the countries array in req so it can be accessed in the POST route
    req.countries = countries;

    // Log countries for debugging
    console.log('Countries:', countries);

    // Render the homepage with countries
    res.render('index', { countries });
  } catch (err) {
    console.log('Error fetching countries:', err);
    res.status(500).send('Error fetching countries');
  }
});

// Route for processing the selected country and displaying brands and sales
app.post('/submit', async (req, res) => {
  const selectedCountry = req.body.country;  // The selected country from the form

  console.log('Selected country:', selectedCountry);  // Debugging log

  if (!selectedCountry) {
    return res.status(400).send('No country selected');
  }

  try {
    // Fetch car brands for the selected country and sort them by the 'sold' field in descending order
    const cars = await Car.find({ country: selectedCountry })
                          .sort({ sold: -1 })
                          .lean();  // This converts Mongoose documents to plain JavaScript objects

    // Log the fetched cars for debugging
    console.log('Fetched cars for the selected country:', cars);

    if (cars.length === 0) {
      return res.status(404).send('No cars found for the selected country');
    }

    // Calculate the total number of cars sold in that country
    const totalSold = cars.reduce((total, car) => total + car.sold, 0);

    // Log the total cars sold
    console.log('Total cars sold:', totalSold);

    // Render the result with the selected country, brands, and total sales
    res.render('index', {
      countries: req.countries,  // Use countries passed from GET / route
      selectedCountry,
      cars,
      totalSold,
    });
  } catch (err) {
    console.log('Error processing submission:', err);
    res.status(500).send('Error processing submission');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://127.0.0.1:${port}`);
});
