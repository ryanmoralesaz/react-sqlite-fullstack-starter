'use strict';

const express = require('express');
// require the bcrypt package for the bcrypt hashsync
const bcrypt = require('bcryptjs');
// import the User class from models
const { User } = require('../models');
// import the authentication middleware function from utils
const authenticateUser = require('./utils/auth.js');
// utilize express router
const router = express.Router();

// GET /api/users - get the current user
router.get('/users', authenticateUser, async (req, res) => {
  // if the users credentials pass the authenticateUser middleware function
  // initialize user to the currentUser that sent the request
  const user = req.currentUser;
  // return a 200 response to the user with a json readout of the accepted credentials
  // filter out the password, createdAt and UpdatedAt for extra credit
  res.status(200).json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress
  });
});

// POST /api/users - create a new user
router.post('/users', async (req, res) => {
  try {
    // use destructuring to get the necessary fields from the request body
    const { firstName, lastName, emailAddress, password } = req.body;
    // use hashing on the user's password before storing it in the database
    // utilize the integer 10 for base-10 decimal system
    const hashedPassword = bcrypt.hashSync(password, 10);
    // create a new user record in the database with required fields
    await User.create({
      firstName,
      lastName,
      emailAddress,
      password: hashedPassword
    });
    // return a entity created status, send a location '/' header and end the route
    res.status(201).location('/').end();
  } catch (error) {
    // check if any caught errors are validaiton errors or unique constraint errors
    // extra credit problem
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      // use the map higher order function to iterate over the errors and pull out the messages
      const errors = error.errors.map((err) => err.message);
      // return a bad request status and give the user an object of error messages
      res.status(400).json({ errors });
    } else {
      // if not a sequelize error return a standard server error message.
      console.error('There was an error creating the user:', error);
      res.status(500).json({ message: 'There was an error creating the user' });
    }
  }
});
module.exports = router;
