'use strict';

// load required dependencies
const express = require('express');
// load CORS for cross origin sharing with browser
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./models');
const usersRouter = require('./routes/users'); // Import the users router
const coursesRouter = require('./routes/courses'); // Import the courses router
// variable to enable global error logging
const enableGlobalErrorLogging =
  process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));
app.use(express.json());

// Configure CORS
app.use(cors(
  {
    origin: 'http://localhost:5171', // The domain of the front end 
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    credentials: true, // allow credentials
  }
));
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to database was successful');
  } catch (error) {
    console.error('Connection to database failed:', error);
  }
})();

// setup a friendly greeting for the root route

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!'
  });
});

app.use('/api', usersRouter); // Use the routers for the /api path
app.use('/api', coursesRouter); // Use the courses router

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found'
  });
});

// setup a global error handler
app.use((err, req, res) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
