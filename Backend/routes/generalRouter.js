const express = require('express');
const {authenticateToken} = require('../middleware/authentication');
const {authorization} = require('../middleware/authorization');
const router = express.Router();

const { allEventsView } = require('../controllers/allEventsView');
const {eventDetail} = require('../controllers/eventDetail');
const { regGet } = require('../controllers/registration/regGet');
const {regPost} = require('../controllers/registration/regPost');
const {allOrganizersView} = require('../controllers/allOrganizersView');
const {followOrganizer} = require('../controllers/followOrganizer');
const {unfollowOrganizer} = require('../controllers/unfollowOrganizer');
const {organizerDetail} = require('../controllers/organizerDetail');
const {adminOrgView} = require('../controllers/adminOrgView');
const {increment} = require('../controllers/increment');
const {getRole} = require('../controllers/getRole');

router.route('/events').get(authenticateToken, allEventsView);
router.route('/events/:eventId').get(authenticateToken, eventDetail)
router.route('/events/:eventId/increment').post(authenticateToken, increment);
router.route('/events/:eventId/register').get(authenticateToken, authorization(['participant']), regGet)
                                            .post(authenticateToken, authorization(['participant']), regPost);
router.route('/organizers').get(authenticateToken, allOrganizersView);
router.route('/organizers/admin').get(authenticateToken,authorization(['admin']), adminOrgView);
router.route('/organizers/:organizerId/follow').post(authenticateToken, authorization(['participant']), followOrganizer);
router.route('/organizers/:organizerId/unfollow').post(authenticateToken, authorization(['participant']), unfollowOrganizer);
router.route('/organizers/:organizerId').get(authenticateToken, authorization(['participant', 'admin']), organizerDetail);
router.route('/role').get(authenticateToken, getRole);


module.exports = router;