const express = require('express');
const { authenticateToken } = require('../middleware/authentication');
const { authorization } = require('../middleware/authorization');
const router = express.Router();

const {viewOrganizer} = require('../controllers/admin/viewOrganizer');
const { addOrganizer } = require('../controllers/admin/addOrganizer');
const { removeOrganizer } = require('../controllers/admin/removeOrganizer');
const { deleteOrganizer } = require('../controllers/admin/deleteOrganizer');
const {enableOrganizer} = require('../controllers/admin/enableOrganizer');
const { listPassReset } = require('../controllers/admin/passwords/listPassReset');
const { postReq } = require('../controllers/admin/passwords/postReq');

router.route('/organizer').get(authenticateToken, authorization(['admin']), viewOrganizer);
router.route('/organizer/add').post(authenticateToken, authorization(['admin']), addOrganizer);
router.route('/organizer/remove').patch(authenticateToken, authorization(['admin']), removeOrganizer);
router.route('/organizer/enable').patch(authenticateToken, authorization(['admin']), enableOrganizer);
router.route('/organizer/delete').delete(authenticateToken, authorization(['admin']), deleteOrganizer);
router.route('/password-reset').get(authenticateToken, authorization(['admin']), listPassReset)
                                .patch(authenticateToken, authorization(['admin']), postReq);

module.exports = router;