const Joi = require('joi');
const { validateSchema } = require('../../../validators/validator');
const logger = require('../../../config/logger');
const utils = require('../../../utils/globals');

const add = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "Page",
        apiHandler: "Add"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body });
        const schema = Joi.object().keys({
            type: Joi.string().required().valid('ABOUT_US', 'TERMS_AND_CONDITION', 'PRIVACY_POLICY'),
            description: Joi.string().required(),
            languageCode: Joi.string().default('en'),
            image:Joi.string().optional(),
            status: Joi.string().valid('active', 'deleted').default('active')
        });

        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        };
    }
    catch (error) {
        logger.error(req.logAction, "Page Add validation Error", error.message, error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};

const edit = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "Page",
        apiHandler: "Edit"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body, REQUEST_PARAMS: req.params });
        req.body._id = req.params._id;
        const schema = Joi.object().keys({
            _id: Joi.string().required(),
            type: Joi.string().valid('ABOUT_US', 'TERMS_AND_CONDITION', 'PRIVACY_POLICY'),
            description: Joi.string(),
            languageCode: Joi.string(),
            image:Joi.string().optional(),
            status: Joi.string().valid('active', 'deleted')
        });

        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        };
    }
    catch (error) {
        logger.error(req.logAction, "Page Edit validation Error", error.message, error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};

const view = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "Page",
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
        };
    }
    catch (error) {
        logger.error(req.logAction, "Page View validation Error", error.message, error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};

// const list = (req, res, next) => {
//     req.logAction = {
//         uuid: req.uuid,
//         apiModule: "Page",
//         apiHandler: "List"
//     };
//     try {
//         logger.info(req.logAction, { REQUEST_BODY: req.body, REQUEST_QUERY: req.query });

//         const schema = Joi.object().keys({
//             languageCode: Joi.string(),
//             status: Joi.string().valid('active', 'deleted')
//         });
//         req.body = req.query;
        
//         let validFields = validateSchema(req.body, schema);
//         if (validFields) {
//             return next();
//         };
//     }
//     catch (error) {
//         logger.error(req.logAction, "Page List validation Error", error.message, error.stack);
//         return utils.sendErrorResponse({ message: __(error) }, res);
//     }
// };

const remove = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "Page",
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
        };
    }
    catch (error) {
        logger.error(req.logAction, "Page Remove validation Error", error.message, error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};
const getPageByName = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "Page",
        apiHandler: "getPageByName"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body, PATH_PARAMS: req.params });
        const schema = Joi.object().keys({
            type: Joi.string().required().valid('ABOUT_US', 'TERMS_AND_CONDITION', 'PRIVACY_POLICY'),
        });

        let validFields = validateSchema(req.params, schema);

        if (validFields) {
            return next();
        };

    } catch (error) {
        logger.error(req.logAction, "content page details by name validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};
const list = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "Page",
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
            status: Joi.string().allow(null, '').optional(),
            languageCode:Joi.string().optional().allow('en','fr'),
        });

        let validFields = validateSchema(req.body, schema);

        if (validFields) {
            return next();
        };

    } catch (error) {
        logger.error(req.logAction, "Page List validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};
module.exports = { add, edit, view, list, remove ,getPageByName};