'use strict';

const express = require('express');
// import the Course and User class from models
const { Course, User } = require('../models');
// import the authenticateUser middleware function
const authenticateUser = require('./utils/auth.js');
// utilize express Router
const router = express.Router();

// GET /api/courses get a list of all of the user's courses
router.get('/courses', async (req, res) => {
  try {
    // use a promise to find all of the user courses but exclude some attributes
    // initialize the courses 
    const courses = await Course.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'emailAddress'] // exclude the createdAt, updatedAt, and password fields
        }
      ],
      attributes: [
        'id',
        'title',
        'description',
        'estimatedTime',
        'materialsNeeded'
      ] // exclude createdAt, and updatedAt fields
    });
    // early return if no courses are found return a resource not found message
    if (courses.length === 0) {
      return res.status(404).send({ message: 'No courses found' });
    }
    // if the course/s are found return the json of courses with a successful response
    res.status(200).json(courses);
  } catch (error) {
    // if there is a server lookup problem return a standard server error message
    console.error('Error fetching the courses:', error);
    res.status(500).json({
      message: 'Error fetching the courses',
      error
    });
  }
});

// GET /api/courses/:id
// We're going to return the corresponding requested course by id including the User association
router.get(`/courses/:id`, async (req, res) => {
  try {
    // find the course be the primary key
    // include the User info excluding some fields
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'emailAddress'] // exclude the createAd, updatedAt, and password fields
        }
      ],
      attributes: [
        'id',
        'title',
        'description',
        'estimatedTime',
        'materialsNeeded'
      ] // exclude the created at and updatedAt fields
    });
    // early return if the specified course does not exist
    if (!course) {
      return res.status(404).json({ message: 'Course was not found' });
    }
    // return the json of the course with a successful message
    res.status(200).json(course);
  } catch (error) {
    // return a standard server error message if there was a problem
    console.error('There was an error getting the course:', error);
    res.status(500).json({
      message: 'Error fetching the course',
      error
    });
  }
});

// POST /api/courses
// create a new course if the user is authenticated
router.post('/courses', authenticateUser, async (req, res) => {
  try {
    // initialize the body of the request to the course variable
    const course = req.body;
    // Associate the coures with the authenticated user
    course.userId = req.currentUser.id;
    // asynchronously wait for the course to be created with the sequelize create() method
    await Course.create(course);
    // return a resource created status and a location header of the new resource
    res.status(201).location(`/api/courses/${course.id}`).end();
  } catch (error) {
    // send a 400 bad request error to the client with the error message
    console.error('Error creating the course:', error);
    res
      .status(400)
      .json({ message: 'There was an error creating the course', error });
  }
});

// PUT /api/courses/:id
// We're going to update the corresponding course that matches the id parameter
// if the user is authenticated
router.put('/courses/:id', authenticateUser, async (req, res) => {
  try {
    // initialize the requested course to the course const by its primary key that matches the params id
    const course = await Course.findByPk(req.params.id);
    // early return if the course isn't found
    if (!course) {
      // send a resource not found message
      return res.status(404).json({
        message: 'Course not found'
      });
    }
    // compare the course user id to the authenticated user id
    if (course.userId === req.currentUser.id) {
      // update the course
      await course.update(req.body);
      // send a no content status code after update
      res.status(204).end();
    } else {
      // send an access denied message if not authenticated user
      res.status(403).json({
        message: 'Access Denied. User is not owner of requested course.'
      });
    }
  } catch (error) {
    // early return for validation error
    if (error.name === 'SequelizeValidationError') {
      // send the user the error messages with a bad request status
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({ errors });
    }
    // return a standard server error status and message
    console.error('Error updating course', error);
    res.status(500).json({ message: 'Error updating course' });
  }
});

// DELETE /api/courses/:id
// We're going to delete the courses with the matching params id if the user is the authenticated owner of the course
router.delete(`/courses/:id`, authenticateUser, async (req, res) => {
  try {
    // find the course by primary key that matching params.id
    const course = await Course.findByPk(req.params.id);
    // early return if course not found
    if (!course) {
      // return a resource not found status message
      console.error('Error deleting the course: ', error);
      return res
        .status(404)
        .json({
          message: 'Error deleting the course. Course not found.',
          error
        });
    }
    // if the course owner id matches the id of the authenticated user allow the delete request
    if (course.userId === req.currentUser.id) {
      // delete the course with the sequelize destroy() method
      await course.destroy();
      // return a no content response
      res.status(204).end();
    } else {
      // return an access denied message for non owner
      res.status(403).json({
        message: 'Access denied: User is not the owner of the course.'
      });
    }
  } catch (error) {
    // return a bad request status with an error message
    console.error('There was an error deleting the course', error);
    res.status(400).json({
      message: 'Error deleting the course',
      error
    });
  }
});

module.exports = router;
