const express = require('express');
const router = express.Router();
const uservalidators = require('./validators/users');
const userController = require('./controllers/users');
const { authUser } = require('../../middleware/authentication');
const multer = require('multer');
const upload = multer();

router.post('/register', uservalidators.register, userController.register);
router.post('/login', uservalidators.login, userController.login);
router.post('/forgot', uservalidators.forgot, userController.forgot);
router.post('/verify_otp', uservalidators.verifyOTP, userController.verifyOTP);
router.post('/set_password', authUser, uservalidators.setPassword, userController.setPassword);
router.put('/change_password', authUser, uservalidators.changePassword, userController.changePassword);
router.put('/edit', authUser, uservalidators.edit, userController.edit);
router.get('/profile', authUser, uservalidators.profile, userController.profile);
router.post('/verify_phone', uservalidators.verifyPhone, userController.verifyContact);

router.get('/questions', authUser, uservalidators.questions, userController.questions);
router.post('/upload', upload.fields([ { name: 'file', maxCount: 1 } ]), uservalidators.upload, userController.upload);
router.post('/upload_image',upload.fields([ { name: 'file', maxCount: 1 } ]), uservalidators.upload, userController.upload);
router.post('/logout', authUser, userController.logout);

module.exports = router;