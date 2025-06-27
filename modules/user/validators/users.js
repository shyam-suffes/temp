const Joi = require('joi');
const { password } = require('../validators/custom');
const { validateSchema } = require('../../../validators/validator');
const logger = require('../../../config/logger');
const utils = require('../../../utils/globals');

const register = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "User",
        apiHandler: "Register"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body });
        const schema = Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().required().email(),
            gender: Joi.string().optional(),
            imageUrl: Joi.string().optional(),
            OTP: Joi.string().required(),
            OTPExp: Joi.date().optional(),
            authToken: Joi.string().optional(),
            role: Joi.string().valid('admin', 'user').default('user'),
            status: Joi.string().valid('active', 'blocked', 'deleted').default('active'),
            password: Joi.string().required().custom(password),
        });

        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        };
    } 
    catch (error) {
        logger.error(req.logAction, "User register validation error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};


const login = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "User",
        apiHandler: "Login"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body });
        const schema = Joi.object().keys({
            email: Joi.string().required().email(),
            password: Joi.string().required().custom(password)
        });
        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        };
    } 
    catch (error) {
        logger.error(req.logAction, "User login validation error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};

const forgot = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "User",
        apiHandler: "Forget"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body });
        const schema = Joi.object().keys({
            email: Joi.string().required().email(),
        });
        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        };
    } 
    catch (error) {
        logger.error(req.logAction, "User forget validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: (error) }, res);
    }
};

const verifyOTP = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "User",
        apiHandler: "VerifyOTP"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body });
        const schema = Joi.object().keys({
            email: Joi.string().required().email(),
            OTP: Joi.number().required(),
            password: Joi.string().required().custom(password),
        });
        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        };
    } 
    catch (error) {
        logger.error(req.logAction, "User verifyOTP validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: (error) }, res);
    }
};

const setPassword = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "User",
        apiHandler: "SetPassword"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body });
        const schema = Joi.object().keys({
            password: Joi.string().required().custom(password),
            confirmPassword: Joi.string().required().custom(password)
        });
        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        };
    } 
    catch (error) {
        logger.error(req.logAction, "User setPassword validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: (error) }, res);
    }
};

const changePassword = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "User",
        apiHandler: "ChangePassword"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body });
        const schema = Joi.object().keys({
            oldPassword: Joi.string().required(),
            password: Joi.string().required().custom(password),
            // confirmPassword: Joi.string().required().custom(password),
        });
        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        };
    } 
    catch (error) {
        logger.error(req.logAction, "User changePassword validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: (error) }, res);
    }
};

const edit = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "User",
        apiHandler: "Edit"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body });
        const schema = Joi.object().keys({
            name: Joi.string(),
            surname: Joi.string(),
            email: Joi.string(),
            phoneNo: Joi.string(),
            countryCode: Joi.string(),
            imageUrl: Joi.string(),
            gender: Joi.string().valid('male', 'female', 'other'),
            documentType: Joi.string(),
            documentNo: Joi.string(),
            dob: Joi.string(),
            personalInfo: Joi.boolean().valid(true, false),
            medicalHistory: Joi.object(),
            OTP: Joi.string().optional(),
        });
        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        };
    } 
    catch (error) {
        logger.error(req.logAction, "User edit validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: (error) }, res);
    }
};

const verifyPhone = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "User",
        apiHandler: "VerifyPhone"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body });
        const schema = Joi.object().keys({
            type:Joi.string().required(),
            phoneNo: Joi.string().optional(),
            countryCode: Joi.string().optional(),
            email: Joi.string().optional(),
        });
        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        };
    } 
    catch (error) {
        logger.error(req.logAction, "User verifyPhone validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: (error) }, res);
    }
};

const upload = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "User",
        apiHandler: "Upload"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body });
        req.body.file = req.files.file;
        const schema = Joi.object().keys({
            file: Joi.array().required()
        });
        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        };
    }
    catch (error) {
        console.log("errpr====>",error)
        logger.error(req.logAction, "User upload validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: (error) }, res);
    }
};

const profile = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "User",
        apiHandler: "Profile"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body });
        return next();
    }
    catch (error) {
        logger.error(req.logAction, "User Profile validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: (error) }, res);
    }
};

const questions = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "User",
        apiHandler: "Questions"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body });
        return next();
    }
    catch (error) {
        logger.error(req.logAction, "User Questions validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: (error) }, res);
    }
};

module.exports = {
    register,
    login,
    forgot,
    verifyOTP,
    setPassword,
    changePassword,
    edit,
    verifyPhone,
    upload,
    profile,
    questions
};