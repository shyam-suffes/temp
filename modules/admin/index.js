const express = require('express');
const router = express.Router();
const { authUser,authenticateAdmin } = require('../../middleware/authentication');
const multer = require('multer');
const upload = multer();

const adminValidators = require('./validators/admin');
const adminController = require('./controllers/admin');
const faqvalidators = require('./validators/faq');
const faqController = require('./controllers/faq');
const pagevalidators = require('./validators/page');
const pageController = require('./controllers/page');
const userController = require('./controllers/users')
const userValidators = require('./validators/users')
const capabilityController = require('./controllers/capability')
const capabilityValidator =  require('./validators/capability')

const subAdminController = require('./controllers/subadmin')
const subAdminValidator  = require('./validators/subadmin')

router.post('/register',adminController.register)
router.post('/login', adminValidators.login, adminController.login);
router.post('/forgot', adminValidators.forgot, adminController.forgot);
router.post('/verify_otp', adminValidators.verifyOTP, adminController.verifyOTP);
router.post('/set_password', authenticateAdmin, adminValidators.setPassword, adminController.setPassword);
router.put('/change_password', authenticateAdmin, adminValidators.changePassword, adminController.changePassword);
router.put('/edit', authenticateAdmin, adminValidators.edit, adminController.edit);
router.post('/upload', authenticateAdmin, upload.fields([ { name: 'file', maxCount: 1 } ]), adminValidators.upload, adminController.upload);

//////Faq
router.post('/faq/create', authenticateAdmin, faqvalidators.add, faqController.add);
router.get('/faq/:_id', authenticateAdmin, faqvalidators.view, faqController.view);
router.put('/faq/:_id', authenticateAdmin, faqvalidators.edit, faqController.edit);
router.post('/faq/list', authUser, faqvalidators.list, faqController.list);
router.delete('/faq/:_id', authenticateAdmin, faqvalidators.remove, faqController.remove);

//////Page
router.post('/pages/create', authenticateAdmin, pagevalidators.add, pageController.add);
router.get('/pages/:_id', authenticateAdmin, pagevalidators.view, pageController.view);
router.put('/pages/:_id', authenticateAdmin, pagevalidators.edit, pageController.edit);
router.post('/pages/list', authUser, pagevalidators.list, pageController.list);
router.delete('/pages/:_id', authenticateAdmin, pagevalidators.remove, pageController.remove);
router.get('/pages/byname/:type',pagevalidators.getPageByName, pageController.getPageByName);

/////users
router.post('/user/list',authenticateAdmin, userValidators.list,userController.list)
router.get('/user/profile/:_id',authenticateAdmin,userValidators.detail,userController.getUserById)
router.put('/user/edit/:_id',authenticateAdmin,userValidators.editUser,userController.edit)
router.delete('/user/delete/:_id',authenticateAdmin,userValidators.removeUser,userController.deleteUser)

////capability
router.post("/capabilities/create",capabilityValidator.createCapability ,authenticateAdmin,capabilityController.createCapability);
router.put("/capabilities/:_id",capabilityValidator.updateCapability,authenticateAdmin ,capabilityController.updateCapability);
router.get("/capabilities/list", authUser,capabilityController.listCapabilities);
router.delete("/capabilities/:_id", capabilityValidator.deleteCapability,authenticateAdmin,capabilityController.deleteCapability);
router.get("/capabilities/:_id",capabilityValidator.getCapabilityDetail,authenticateAdmin,capabilityController.getCapabilityById);

//subAdmin
router.post('/create/subadmin',subAdminValidator.addSubAdmin,authenticateAdmin,subAdminController.createSubAdmin)
router.post('/list/subadmin',authenticateAdmin,subAdminController.list)
router.get('/subadmin/:_id',authenticateAdmin,subAdminController.getSubAdmin)
router.put('/edit/subadmin/:_id',subAdminValidator.editSubAdmin,authenticateAdmin,subAdminController.editSubAdmin)


module.exports = router;