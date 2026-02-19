const express = require('express');
const { authenticateToken } = require('../middleware/authentication');
const { authorization } = require('../middleware/authorization');
const router = express.Router();

const { onboardPost } = require('../controllers/onboarding/onboardingPost');
const { onboardGet } = require('../controllers/onboarding/onboardingGet');
const { getProfile } = require("../controllers/participantProfiles/profile");
const {profilePost} = require("../controllers/participantProfiles/profilePost");
const {resetPassword} = require("../controllers/participantProfiles/resetPassword");
const { upcoming } = require('../controllers/participantDashboard/upcoming');
const { normal } = require('../controllers/participantDashboard/history/normal');
const {merch} = require('../controllers/participantDashboard/history/merch');
const {closed} = require('../controllers/participantDashboard/history/closed');
const {cancelled} = require('../controllers/participantDashboard/history/cancelled');
const {showRegs} = require('../controllers/participantDashboard/showRegs');
const {detailReg} = require('../controllers/participantDashboard/detailReg');
const {cancelReg} = require('../controllers/participantDashboard/cancelReg');
const {uploadPaymentProof} = require('../controllers/participantPayment/uploadPaymentProof');

router.route('/onboarding').patch(authenticateToken, authorization(['participant']), onboardPost)
                                .get(authenticateToken, authorization(['participant']), onboardGet);

router.route('/').get(authenticateToken, authorization(['participant']), getProfile);

router.route('/edit').get(authenticateToken, authorization(['participant']), getProfile)
                    .patch(authenticateToken, authorization(['participant']), profilePost);

router.route('/reset-password').patch(authenticateToken, authorization(['participant']), resetPassword);

router.route('/dashboard/upcoming').get(authenticateToken, authorization(['participant']), upcoming);
router.route('/dashboard/history/normal').get(authenticateToken, authorization(['participant']), normal);
router.route('/dashboard/history/merch').get(authenticateToken, authorization(['participant']), merch);
router.route('/dashboard/history/closed').get(authenticateToken, authorization(['participant']), closed);
router.route('/dashboard/history/cancelled').get(authenticateToken, authorization(['participant']), cancelled);
router.route('/dashboard/registrations').get(authenticateToken, authorization(['participant']), showRegs);
router.route('/dashboard/registrations/:regId').get(authenticateToken, authorization(['participant']), detailReg);
router.route('/dashboard/registrations/:regId/cancel').patch(authenticateToken, authorization(['participant']), cancelReg);
router.route('/events/payment/:id').post(authenticateToken, authorization(['participant']), uploadPaymentProof);

module.exports = router;