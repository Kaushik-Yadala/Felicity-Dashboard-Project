const express = require('express');
const { authenticateToken } = require('../middleware/authentication');
const { authorization } = require('../middleware/authorization');
const router = express.Router();

const { createDraft } = require('../controllers/organizer/events/createDraft');
const { editEventGet } = require('../controllers/organizer/events/editEventGet');
const { editEventPost } = require('../controllers/organizer/events/editEventPost');
const { publishEvent } = require('../controllers/organizer/events/publishEvent');
const { viewEvent } = require('../controllers/organizer/events/viewEvent');
const {dashboard} = require('../controllers/organizer/dashboard');
const {profileGet} = require('../controllers/organizer/profileGet');
const {profilePost} = require('../controllers/organizer/profilePost');
const { ongoingView } = require('../controllers/organizer/events/ongoingView');
const { passwordReset } = require('../controllers/organizer/passwordReset');
const {getPasswordReset} = require('../controllers/organizer/getPasswordReset');
const { scanTicket } = require('../controllers/organizer/events/scanTicket');
const { getPendingPayments } = require('../controllers/organizer/payments/getPendingPayments');
const { approvePayment } = require('../controllers/organizer/payments/approvePayment');
const { rejectPayment } = require('../controllers/organizer/payments/rejectPayment');

router.route('/event/create').post(authenticateToken, authorization(['organizer']), createDraft);
router.route('/event/ongoing').get(authenticateToken, authorization(['organizer']), ongoingView);
router.route('/event/:eventId/edit').get(authenticateToken, authorization(['organizer']), editEventGet)
                                .patch(authenticateToken, authorization(['organizer']), editEventPost);
router.route('/event/:eventId/publish').post(authenticateToken, authorization(['organizer']), publishEvent);
router.route('/event/:eventId').get(authenticateToken, authorization(['organizer']), viewEvent);
router.route('/dashboard').get(authenticateToken, authorization(['organizer']), dashboard);
router.route('/profile').get(authenticateToken, authorization(['organizer']), profileGet)
                        .patch(authenticateToken, authorization(['organizer']), profilePost);
router.route('/profile/password-reset').post(authenticateToken, authorization(['organizer']), passwordReset)
                                .get(authenticateToken, authorization(['organizer']), getPasswordReset);
router.route('/event/:eventId/scan-ticket').post(authenticateToken, authorization(['organizer']), scanTicket);
router.route('/payments').get(authenticateToken, authorization(['organizer']), getPendingPayments);
router.route('/payments/:registrationId/approve').post(authenticateToken, authorization(['organizer']), approvePayment);
router.route('/payments/:registrationId/reject').post(authenticateToken, authorization(['organizer']), rejectPayment);

module.exports = router;