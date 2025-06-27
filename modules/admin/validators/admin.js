const Joi = require('joi');
const { password } = require('../validators/custom');
const { validateSchema } = require('../../../validators/validator');
const logger = require('../../../config/logger');
const utils = require('../../../utils/globals');

const login = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "Admin",
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
        logger.error(req.logAction, "Admin login validation error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};

const forgot = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "Admin",
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
        logger.error(req.logAction, "Admin forget validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};

const verifyOTP = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "Admin",
        apiHandler: "VerifyOTP"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body });
        const schema = Joi.object().keys({
            email: Joi.string().required().email(),
            OTP: Joi.number().required()
        });
        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        };
    } 
    catch (error) {
        logger.error(req.logAction, "Admin verifyOTP validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};

const setPassword = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "Admin",
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
        logger.error(req.logAction, "Admin setPassword validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};

const changePassword = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "Admin",
        apiHandler: "ChangePassword"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body });
        const schema = Joi.object().keys({
            oldPassword: Joi.string().required().custom(password),
            password: Joi.string().required().custom(password),
            confirmPassword: Joi.string().required().custom(password),
        });
        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        };
    } 
    catch (error) {
        logger.error(req.logAction, "Admin changePassword validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};

const edit = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "Admin",
        apiHandler: "Edit"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body });
        const schema = Joi.object().keys({
            name: Joi.string(),
            email: Joi.string(),
            phoneNo: Joi.string(),
            countryCode: Joi.string(),
            imageUrl: Joi.string()
        });
        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        };
    } 
    catch (error) {
        logger.error(req.logAction, "Admin edit validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};

const upload = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "Admin",
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
        logger.error(req.logAction, "Admin upload validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};

module.exports = {
    login,
    forgot,
    verifyOTP,
    setPassword,
    changePassword,
    edit,
    upload
};