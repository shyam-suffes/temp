const Joi = require('joi');
const { validateSchema } = require('../../../validators/validator');
const logger = require('../../../config/logger');
const utils = require('../../../utils/globals');


const editUser = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "users",
        apiHandler: "Edit"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body, REQUEST_PARAMS: req.params });

        const schema = Joi.object().keys({
            name: Joi.string().optional(),
            surname: Joi.string().optional(),
            email: Joi.string().optional().email(),
            countryCode: Joi.string().optional(),
            phoneNo: Joi.string().optional(),
            gender: Joi.string().optional(),
            imageUrl: Joi.string().optional(),
            documentType: Joi.string().optional(),
            documentNo: Joi.string().optional(),
            dob: Joi.string().optional(),
            status: Joi.string().valid('active', 'blocked', 'deleted','inactive').optional(),
            personalInfo: Joi.boolean().optional(),
            medicalHistory: Joi.object().optional(),
            OTP: Joi.forbidden(), // Prevent modification
            OTPExp: Joi.forbidden(),
            stripeCusId: Joi.forbidden(),
            authToken: Joi.forbidden(),
            password: Joi.forbidden(),
            confirmPassword: Joi.forbidden(),
        });

        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        };
    } 
    catch (error) {
        logger.error(req.logAction, "User edit validation error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};
const list = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "users",
        apiHandler: "list"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body });
        const schema = Joi.object().keys({
            search: Joi.string().allow(null, '').optional(),
            pageNo: Joi.number().required(),
            limit: Joi.number().required(),
            orderBy: Joi.string().required(),
            order: Joi.number().required(),
            fieldName: Joi.string().allow(null, '').optional(),
            fieldValue: Joi.string().allow(null, '').optional(),
            status: Joi.string().allow(null, '').optional(),
            phoneNo: Joi.string().optional(),

        });

        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        };
    }
    catch (error) {
        logger.error(req.logAction, "Admin list get validation error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};
const detail = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "users",
        apiHandler: "details"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body, PATH_PARAMS: req.params });
        const schema = Joi.object().keys({
            _id: Joi.string().required(),
        });

        let validFields = validateSchema(req.params, schema);

        if (validFields) {
            return next();
        };

    } catch (error) {
        logger.error(req.logAction, "Admin User details validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};
const removeUser = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "admin remove user",
        apiHandler: "remove"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body, PATH_PARAMS: req.params });
        const schema = Joi.object().keys({
            _id: Joi.string().required(),
        });

        let validFields = validateSchema(req.params, schema);

        if (validFields) {
            return next();
        };

    } catch (error) {
        logger.error(req.logAction, "Admin remove user validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};
module.exports = {editUser,list,removeUser,detail}