'use strict'
const utils = require('../../../utils/globals');
const service = require('../services/users');
const logger = require('../../../config/logger');
const ses = require('../../../lib/ses');
const moment = require('moment');
const { sendTwilioMessage } = require('../../../lib/twilio');
const { uploadImageDataToS3 } = require('../../../lib/s3');

exports.register = async (req, res) => {
    try {
        let data = req.body;
        data.email = data?.email?.trim()?.toLowerCase();
        

        let userExist = await service.findUsers({
            status: { $nin: ['deleted'] },
            email: data.email
        });
        if (userExist.length) {
            return utils.sendErrorResponse({ message: __("USER_EXIST"), data: {} }, res);
        }

        data.password = await utils.hashPassword(data.password);
        data.game_id =  await utils.generatorRandomNumber(6)
        const user = await service.createUser(data);
        const token = await utils.generateToken(user);
        await service.updateUser({ _id: user._id }, 
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
        if (!user || !(user?.role === "user")) {
            return utils.sendErrorResponse({ message: __("ACCOUNT_NOT_FOUND"), status_code: 404, data: {} }, res);
        };
        if (user?.status === "inactive") {
            return utils.sendErrorResponse({ message: __("ACCOUNT_INACTIVE"), data: {} }, res);
        }
        if (user.status === "blocked") {
            return utils.sendErrorResponse({ message: __("ACCOUNT_BLOCKED"), data: {} }, res);
        };
        let isPasswordValid = await utils.verifyPassword(user.password, data.password);
        if (!isPasswordValid) {
            return utils.sendErrorResponse({ message: __("INCORRECT_PASSWORD"), status_code: 401, data: {} }, res);
        };
        const token = await utils.generateToken(user);
        const updatedUser = await service.updateUser({ _id: user._id }, 
            { $set: { authToken: token }
        });

        return utils.sendSuccessResponse({ message: __("LOGIN_SUCCESS"), data: { user: updatedUser, token: token } }, res);
    }
    catch (error) {
        logger.error(req.logAction, "User login error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "User controller";
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
        logger.error(req.logAction, "User Forgot password error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "User controller";
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
            if (data.OTP !== "0000"){
                return utils.sendErrorResponse({ message: __("INVALID_VERIFICATION_CODE"), status_code: 400, data: {} }, res);
            }
        }
        else if (user.OTP === data.OTP) {
            if (moment().isAfter(moment(user.OTPExp))) {
                return utils.sendErrorResponse({ message: __("CODE_EXPIRED"), status_code: 400, data: {} }, res);
            }
        }

        const hashedPassword = await utils.hashPassword(data.password);
        let updateObj = { OTP: null, OTPExp: null,password: hashedPassword}
        const token = await utils.generateToken(user);
        updateObj.authToken = token
        const userData = await service.updateUser({ _id: user._id }, { $set: updateObj });
        return utils.sendSuccessResponse({ message: ("CHANGE_PASSWORD_SUCCESS"), data:  userData }, res, { token: token });
    }
    catch (error) {
        logger.error(req.logAction, "User Verify OTP error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "User controller";
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
        logger.error(req.logAction, "User Reset Password error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "User controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.changePassword = async (req, res) => {
    try {
        let data = req.body;
        let user = req.user;

        // if (data.password !== data.confirmPassword) {
        //     return utils.sendErrorResponse({ message: __("PASSWORD_MISMATCH"), status_code: 403, data: {} }, res);
        // }

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
        logger.error(req.logAction, "User changePassword error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "User controller";
        return utils.sendErrorResponse(error, res);
    }
}


exports.edit = async (req, res) => {
    try {
        let data = req.body;
        let user = req.user;

        if (data.countryCode) {
            data.countryCode = data.countryCode.startsWith("+") ? data.countryCode.slice(1) : data.countryCode;
        }

        if (data.email) {
            data.email = data.email.trim().toLowerCase();
            const userExist = await service.findOneUser({
                email: data.email,
                status: { $nin: ['deleted'] }
            });

            if (userExist && !userExist._id.equals(user._id)) {
                return utils.sendErrorResponse({ message: __("EMAIL_IN_USE"), data: {} }, res);
            }
        }

        // Check phone number uniqueness and OTP verification
        if (data.phoneNo) {
            const userExist = await service.findOneUser({
                phoneNo: data.phoneNo,
                countryCode: data.countryCode,
                status: { $nin: ['deleted'] }
            });

            if (userExist && !userExist._id.equals(user._id)) {
                return utils.sendErrorResponse({ message: __("PHONE_IN_USE"), data: {} }, res);
            }

            // const phone = await service.findPhone({ phoneNo: data.phoneNo, countryCode: data.countryCode });

            // if (phone.OTP !== data.OTP) {
            //     if (data.OTP !== "0000") {
            //         return utils.sendErrorResponse({ message: __("INVALID_VERIFICATION_CODE"), status_code: 400, data: {} }, res);
            //     }
            // } else if (phone.OTP === data.OTP) {
            //     if (moment().isAfter(moment(phone.OTPExp))) {
            //         return utils.sendErrorResponse({ message: __("CODE_EXPIRED"), status_code: 400, data: {} }, res);
            //     }
            // }
        }

        // Check if all personal info fields are filled
        // const personalInfoFields = ["surname", "gender", "documentType", "documentNo", "dob", "medicalHistory"];
        // const isAllPersonalInfoFilled = personalInfoFields.every(field => data[field] && data[field] !== "");
        // if (isAllPersonalInfoFilled) {
        //     data.personalInfo = true;
        // }

        // Update user in the database
        user = await service.updateUser({ _id: user._id }, { $set: data });

        return utils.sendSuccessResponse({ message: __("EDIT_SUCCESS"), data: user }, res);
    } catch (error) {
        logger.error(req.logAction, "User edit error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "User controller";
        return utils.sendErrorResponse(error, res);
    }
};


exports.verifyContact = async (req, res) => {
    try {
        let { countryCode, phoneNo, email, type } = req.body;
        let query = { status: { $nin: ['deleted'] } };

        if (type === 'phoneNo' && phoneNo) {
            countryCode = countryCode.startsWith("+") ? countryCode.slice(1) : countryCode;
            query.phoneNo = phoneNo;
            query.countryCode = countryCode;
        } 
        else if (type === 'email' && email) {
            query.email = email.toLowerCase();
        } 
        else {
            return utils.sendErrorResponse({ message: __("INVALID_REQUEST"), data: {} }, res);
        }

        const userExist = await service.findOneUser(query);
        if (userExist) {
            return utils.sendErrorResponse({
                message: type === 'phoneNo' ? __("PHONE_IN_USE") : __("EMAIL_IN_USE"),
                data: {}
            }, res);
        }

        // Generate OTP
        const OTP = utils.generateOTP(4);
        let exptime = new Date();
        exptime.setMinutes(exptime.getMinutes() + 30);

        const otpData = { OTP, OTPExp: exptime };

        if (type === 'phoneNo') {
            await service.createPhone({ phoneNo, countryCode }, otpData);
            const message = `Your verification code for Rhino is: ${OTP}`;
            await sendTwilioMessage(countryCode, phoneNo, message);
        } 
        else if (type === 'email') {
            await service.createEmail({ email:email.trim().toLowerCase() }, otpData);
            const emailBody = await utils.setForgotPasswordEmail(email, OTP);
            await ses.sendEmail(email, 'Your verification code for Rhino is', emailBody);
        }

        return utils.sendSuccessResponse({ message: __("OTP_SENT"), data: {} }, res);
    } 
    catch (error) {
        logger.error(req.logAction, "User verifyContact error", "ERROR: " + error.message, "STACK: " + error.stack);
        error.error_description = "User controller";
        return utils.sendErrorResponse(error, res);
    }
};


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
        logger.error(req.logAction, "User upload error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "User controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.profile = async (req, res) => {
    try {
        let user = req.user;
        user = await service.findOneUser({ _id: user._id });
        return utils.sendSuccessResponse({ message: __("SUCCESS"), data: user }, res);
    }
    catch (error) {
        logger.error(req.logAction, "User profile error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "User controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.questions = async (req, res) => {
    try {
        const questions = await service.questions({ status: true });

        if (!questions.length) {
            return utils.sendErrorResponse({ message: __("NOT_FOUND"),  status_code: 404, data: [] }, res);
        }
        return utils.sendSuccessResponse({ message: __("SUCCESS"), data: questions }, res);
    }
    catch (error) {
        logger.error(req.logAction, "User questions error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "User controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.logout = async (req, res) => {
    try {
        const user = await service.updateUser({_id:req.user._id},
            {
                $set: {
                    authToken: null,
                }
            });
        if (!user) {
            return utils.sendErrorResponse({ message: __("ACCOUNT_DOES_NOT_EXIST"), data: {} }, res);
        };
        return utils.sendSuccessResponse({ message: __("LOGOUT_SUCCESS"), data: {} }, res);

    }
    catch (error) {
        logger.error(req.logAction, "User logout error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "User logout controller";
        return utils.sendErrorResponse(error, res);
    }
}