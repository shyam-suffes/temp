'use strict'
const utils = require('../../../utils/globals');
const service = require('../services/admin');
const logger = require('../../../config/logger');
const ses = require('../../../lib/ses');
const moment = require('moment');
const { uploadImageDataToS3 } = require('../../../lib/s3');





exports.register = async (req, res) => {
    try {
        let data = req.body;
        data.email = data?.email?.trim()?.toLowerCase();
        ////validate user email, password.
        data.countryCode = data.countryCode.startsWith("+") ? data.countryCode.slice(1) : data.countryCode;

        let userExist = await service.findUsers({
            status: { $nin: ['deleted'] },
            $or: [
                { email: data.email },
                { phoneNo: data.phoneNo, countryCode: data.countryCode }
            ]
        });
        if (userExist.length) {
            return utils.sendErrorResponse({ message: __("USER_EXIST"), data: {} }, res);
        }

        data.password = await utils.hashPassword(data.password);
        data.role = 'admin';
        let user = await service.createUser(data);
        const token = await utils.generateToken(user);
        user = await service.updateUser({ _id: user._id }, 
            { $set: { authToken: token }
        });

        return utils.sendSuccessResponse({ message: __("SIGNUP_SUCCESS"), data: { user: user, token: token } }, res);
    }
    catch (error) {
        logger.error(req.logAction, "User register error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "User Controller";
        return utils.sendErrorResponse(error, res);
    }
}


exports.login = async (req, res) => {
    try {
        let data = req.body;
        const user = await service.findOneUser({
            email: data.email.toLowerCase(),
            status: {
                $nin: ['blocked', 'deleted']
            }
        });
        if (!user || user.role === "user") {
            return utils.sendErrorResponse({ message: __("ACCOUNT_NOT_FOUND"), status_code: 404, data: {} }, res);
        };

        let isPasswordValid = await utils.verifyPassword(user.password, data.password);
        if (!isPasswordValid) {
            return utils.sendErrorResponse({ message: __("INCORRECT_PASSWORD"), status_code: 401, data: {} }, res);
        };
        const token = await utils.generateToken(user);
        const updtedData = await service.updateUser({ _id: user._id }, 
            { $set: { authToken: token }
        });

        return utils.sendSuccessResponse({ message: __("LOGIN_SUCCESS"), data: { user: updtedData, token: token } }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Admin login error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Admin controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.forgot = async (req, res) => {
    try {
        let data = req.body;
        data.email = data.email.trim().toLowerCase();
        
        let user = await service.findOneUser({
            email: data.email,
            status: {
                $nin: ['blocked', 'deleted']
            }
        });
        if (!user) {
            return utils.sendErrorResponse({ message: __("ACCOUNT_NOT_FOUND"), status_code: 404, data: {} }, res);
        }
        let OTP = utils.generateOTP(4);
        let exptime = new Date();
        exptime.setMinutes(exptime.getMinutes() + 2);

        await service.updateUser({ _id: user._id }, 
            { $set: {
                OTPExp: exptime,
                OTP: OTP,
                authToken: null
            }
        });

        const emailBody = await utils.setForgotPasswordEmail(user, OTP);
        await ses.sendEmail(data.email, 'RHINO RESET PASSWORD ACTIVATION CODE', emailBody);

        return utils.sendSuccessResponse({ message: __("OTP_SENT"), data: {} }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Admin Forgot password error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Admin controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.verifyOTP = async (req, res) => {
    try {
        let data = req.body;
        let user = await service.findOneUser({
            email: data.email.trim().toLowerCase(),
            status: {
                $nin: ['blocked', 'deleted']
            }
        });
        if (!user) {
            return utils.sendErrorResponse({ message: __("ACCOUNT_NOT_FOUND"), status_code: 404, data: {} }, res);
        }
        if (user.OTP !== data.OTP) {
            return utils.sendErrorResponse({ message: __("INVALID_VERIFICATION_CODE"), status_code: 400, data: {} }, res);
        }
        else if (user.OTP === data.OTP) {
            if (moment().isAfter(moment(user.OTPExp))) {
                return utils.sendErrorResponse({ message: __("CODE_EXPIRED"), status_code: 400, data: {} }, res);
            }
        }

        let updateObj = { OTP: null, OTPExp: null }
        const token = await utils.generateToken(user, '5m');

        await service.updateUser({ _id: user._id }, { $set: updateObj });
        return utils.sendSuccessResponse({ message: ("CODE_VERIFIED_SUCCESS"), data: {} }, res, { token: token });
    }
    catch (error) {
        logger.error(req.logAction, "Admin Verify OTP error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Admin controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.setPassword = async (req, res) => {
    try {
        let data = req.body;
        let user = req.user;
        
        if (data.password !== data.confirmPassword) {
            return utils.sendErrorResponse({ message: __("PASSWORD_MISMATCH"), status_code: 403, data: {} }, res);
        }
        const hashedPassword = await utils.hashPassword(data.password);
        const token = await utils.generateToken(user);
        user = await service.updateUser({ _id: user._id }, { $set: { password: hashedPassword, authToken: token } });

        return utils.sendSuccessResponse({ message: __("SET_PASSWORD_SUCCESS"), data: { user: user, token: token } }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Admin Reset Password error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Admin controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.changePassword = async (req, res) => {
    try {
        let data = req.body;
        let user = req.user;

        if (data.password !== data.confirmPassword) {
            return utils.sendErrorResponse({ message: __("PASSWORD_MISMATCH"), status_code: 403, data: {} }, res);
        }

        let isPasswordValid = await utils.verifyPassword(user.password, data.oldPassword);
        if (!isPasswordValid) {
            return utils.sendErrorResponse({ message: __("OLD_INCORRECT_PASSWORD"), status_code: 403, data: {} }, res);
        };

        const hashedPassword = await utils.hashPassword(data.password);

        user = await service.updateUser( { _id: user._id },
            { $set: { password: hashedPassword }
        });

        return utils.sendSuccessResponse({ message: __("CHANGE_PASSWORD_SUCCESS"), data: user }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Admin changePassword error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Admin controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.edit = async (req, res) => {
    try {
        let data = req.body;
        let user = req.user;

        if (data.email) {
            data.email = data.email.trim().toLowerCase();
            const userExist = await service.findOneUser({
                email: data.email,
                status: { $nin: ['deleted'] }
            });
            if (userExist && (!userExist._id.equals(user._id))) {
                return utils.sendErrorResponse({ message: __("EMAIL_IN_USE"), data: {} }, res);
            }
        }
        if (data.phoneNo) {
            const userExist = await service.findOneUser({
                phoneNo: data.phoneNo,
                countryCode: data.countryCode,
                status: { $nin: ['deleted'] }
            });
            if (userExist && (!userExist._id.equals(user._id))) {
                return utils.sendErrorResponse({ message: __("PHONE_IN_USE"), data: {} }, res);
            }
        }

        user = await service.updateUser({ _id: user._id },
            { $set: data });

        return utils.sendSuccessResponse({ message: __("EDIT_SUCCESS"), data: user }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Admin edit error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Admin controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.upload = async (req, res) => {
    try {       

        let file = req.body.file[0];
        let urlData = '';
        const allowImages = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowImages.includes(file.mimetype)) {
            urlData = await uploadImageDataToS3(file);
        }
        const url = `${urlData['baseUrl']}${urlData['location']}`;
        return utils.sendSuccessResponse({ message: __("SUCCESS"), data: { url: url } }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Admin upload error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Admin controller";
        return utils.sendErrorResponse(error, res);
    }
}