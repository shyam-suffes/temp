
const Joi = require('joi');
const { password } = require('../../user/validators/custom');
const { validateSchema } = require('../../../validators/validator');
const logger = require('../../../config/logger');
const utils = require('../../../utils/globals');



const editSubAdmin = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "subadmin",
        apiHandler: "editSubAdmin"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body, REQUEST_PARAMS: req.params });

        const schema = Joi.object().keys({
            _id: Joi.string().required(),
            name: Joi.string().optional(),
            phoneNo: Joi.string().optional(),
            countryCode: Joi.string().optional(),
            status: Joi.string().optional(),
            role: Joi.string().valid("subAdmin").optional(), // Ensures role is always "SubAdmin"
            // userAddress: Joi.object().keys({
            //     _id: Joi.string().optional(), 
            //     addressLine1: Joi.string().optional(),
            //     addressLine2: Joi.string().optional(),
            //     landmark: Joi.string().optional(),
            //     city: Joi.string().optional(),
            //     state: Joi.string().optional(),
            //     pincode: Joi.string().optional(),
            //     phoneNumber: Joi.string().optional(),
            //     setDefaultAddress: Joi.boolean().optional(),
            //     addressType: Joi.string().valid('Home', 'Work', 'Other').optional(),
            //     remove: Joi.boolean().optional()
            // }).optional(),
            permissions: Joi.object().pattern(
                Joi.string(), 
                Joi.object({
                    view: Joi.boolean().required(),
                    edit: Joi.boolean().required(),
                    delete: Joi.boolean().required(),
                    write: Joi.boolean().required()
                })
            ).optional() // Permissions as an object
        });

        req.body._id = req.params._id;
        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        };
    } catch (error) {
        logger.error(req.logAction, "SubAdmin edit validation error", 
            "ERROR" + ":" + error.message, 
            "STACK" + ":" + error.stack
        );
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};

const addSubAdmin = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "subadmin",
        apiHandler: "addSubAdmin"
    };
    try {
        logger.info(req.logAction, { REQUEST_BODY: req.body });

        const schema = Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().required().email(),
            phoneNo: Joi.string().required(),
            countryCode: Joi.string().optional(),
            password: Joi.string().required().custom(password),
            role: Joi.string().valid("subadmin").required(), // Ensures role is always "SubAdmin"
            status: Joi.string().valid("active", "inactive",'blocked').optional(),
            permissions: Joi.object().pattern(
                Joi.string(), 
                Joi.object({
                    view: Joi.boolean().required(),
                    edit: Joi.boolean().required(),
                    delete: Joi.boolean().required(),
                    write: Joi.boolean().required()
                })
            ).required() // Permissions as an object
        });

        let validFields = validateSchema(req.body, schema);
        if (validFields) {
            return next();
        };
    } catch (error) {
        logger.error(req.logAction, "SubAdmin add validation error", 
            "ERROR" + ":" + error.message, 
            "STACK" + ":" + error.stack
        );
        return utils.sendErrorResponse({ message: __(error) }, res);
    }
};


module.exports ={
    editSubAdmin,
    addSubAdmin
}