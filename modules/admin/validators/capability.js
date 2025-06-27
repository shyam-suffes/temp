const Joi = require('joi');
const { validateSchema } = require('../../../validators/validator');
const logger = require('../../../config/logger');
const utils = require('../../../utils/globals');


const getCapabilityDetail = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "capabilities",
        apiHandler: "getCapabilityById"
    };

    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body, PATH_PARAMS: req.params });

        const schema = Joi.object().keys({
            _id: Joi.string().required(),
        });

        let validFields = validateSchema(req.params, schema);

        if (validFields) {
            return next();
        }

    } catch (error) {
        logger.error(req.logAction, "Capability details validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};


const createCapability = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "capabilities",
        apiHandler: "createCapability"
    };

    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body, PATH_PARAMS: req.params });

        const schema = Joi.object({
            name: Joi.string().required(),
            lable: Joi.string().required(),
            image: Joi.string().allow(null, ""),
            status: Joi.string().valid("active", "deleted").default("active"),
        });

        let validFields = validateSchema(req.body, schema);
        if (validFields) return next();
    } catch (error) {
        logger.error(req.logAction, "Capability create validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};

const updateCapability = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "capabilities",
        apiHandler: "updateCapability"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body, PATH_PARAMS: req.params });
        req.body._id = req.params._id;
        const schema = Joi.object({
            _id: Joi.string().required(),
            name: Joi.string().optional(),
            lable: Joi.string().required(),
            image: Joi.string().allow(null, ""),
            status: Joi.string().valid("active", "deleted").optional(),
        });

        let validFields = validateSchema(req.body, schema);
        if (validFields) return next();
    } catch (error) {
        logger.error(req.logAction, "Capability update validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }

};

const deleteCapability = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "capabilities",
        apiHandler: "deleteCapability"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body, PATH_PARAMS: req.params });

        const schema = Joi.object({
            _id: Joi.string().required(),
        });

        let validFields = validateSchema(req.params, schema);
        if (validFields) return next();
    } catch (error) {
        logger.error(req.logAction, "Capability delete validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};


module.exports = {
    getCapabilityDetail,
    createCapability,
    deleteCapability,
    updateCapability
}