const Joi = require('joi');
const { validateSchema } = require('../../../validators/validator');
const logger = require('../../../config/logger');
const utils = require('../../../utils/globals');

const add = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "Faq",
        apiHandler: "Add"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body });
        const schema = Joi.object().keys({
            question: Joi.string().required(),
            answer: Joi.string().required(),
            status: Joi.string().valid('active', 'deleted').default('active'),
            languageCode: Joi.string().default('en')
        });
        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        }
    } catch (error) {
        logger.error(req.logAction, "Faq Add validation Error", "ERROR: " + error.message, "STACK: " + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};

const edit = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "Faq",
        apiHandler: "Edit"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body, REQUEST_PARAMS: req.params });
        req.body._id = req.params._id;

        const schema = Joi.object().keys({
            _id: Joi.string().required(),
            question: Joi.string().optional(),
            answer: Joi.string().optional(),
            status: Joi.string().valid('active', 'deleted').optional(),
            languageCode: Joi.string().optional()
        });
        
        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        }
    } catch (error) {
        logger.error(req.logAction, "Faq Edit validation Error", "ERROR: " + error.message, "STACK: " + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};

const view = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "Faq",
        apiHandler: "View"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body, REQUEST_PARAMS: req.params });
        req.body._id = req.params._id;

        const schema = Joi.object().keys({
            _id: Joi.string().required()
        });
        
        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        }
    } catch (error) {
        logger.error(req.logAction, "Faq View validation Error", "ERROR: " + error.message, "STACK: " + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};

const list = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "Faq",
        apiHandler: "List"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body, REQUEST_QUERY: req.query });
        console.log("req.body====>",req.body)
        const schema = Joi.object().keys({
            pageNo: Joi.number().required(),
            limit: Joi.number().required(),
            orderBy: Joi.string().required(),
            order: Joi.number().required(),
            status: Joi.string().allow(null, '').optional(),
            search: Joi.string().allow(null, '').optional(),
            languageCode: Joi.string().optional().allow('en', 'fr'),
        });

        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        }
    } catch (error) {
        logger.error(req.logAction, "Faq List validation Error", "ERROR: " + error.message, "STACK: " + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};

const remove = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "Faq",
        apiHandler: "Remove"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body, REQUEST_PARAMS: req.params });
        req.body._id = req.params._id;

        const schema = Joi.object().keys({
            _id: Joi.string().required()
        });
        
        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        }
    } catch (error) {
        logger.error(req.logAction, "Faq Remove validation Error", "ERROR: " + error.message, "STACK: " + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};

module.exports = { add, edit, view, list, remove };