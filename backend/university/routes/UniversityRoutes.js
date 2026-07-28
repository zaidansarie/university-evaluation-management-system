const express = require('express');
const router = express.Router();
const UniversityController = require('../controller/UniversityController');

// Define routes for University Management
router.post('/', UniversityController.createUniversity);
router.get('/', UniversityController.getUniversities);
router.get('/:id', UniversityController.getUniversityById);
router.put('/:id', UniversityController.updateUniversity);
router.delete('/:id', UniversityController.deleteUniversity);

module.exports = router;
