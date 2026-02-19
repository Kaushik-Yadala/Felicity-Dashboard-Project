const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/authentication');
const { authorization } = require('../middleware/authorization');

const { signup } = require('../controllers/signup');
const { login } = require('../controllers/login');
const { check } = require('../controllers/check');

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/participant').get(authenticateToken, authorization(['participant']), check);
router.route('/organizer').get(authenticateToken, authorization(['organizer']), check);
router.route('/admin').get(authenticateToken, authorization(['admin']), check);

module.exports = router;