
'use strict'
const utils = require('../../../utils/globals');
const capabilityService = require('../services/capability');
const logger = require('../../../config/logger');

exports.createCapability = async (req, res) => {
    try {
        const { name, image } = req.body;

        const existingCapability = await capabilityService.findOne({ name });
        if (existingCapability) {
            return utils.sendErrorResponse({ message: __("Capability already exists.") }, res);
        }

        const capability = { name, image };
        const data  = await capabilityService.createOne(capability)

        return utils.sendSuccessResponse({ message: __("Capability created successfully."), data }, res);
    } catch (error) {
        logger.error(req.logAction, "Capability creation error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Capability Controller";
        return utils.sendErrorResponse(error, res);
    }
};

exports.updateCapability = async (req, res) => {
    try {
        const { _id } = req.params;
        const data = req.body;

        const capability = await capabilityService.updateById({_id:_id},{ $set: data });

        if (!capability) {
            return utils.sendErrorResponse({ message: __("Capability not found.") }, res);
        }

        return utils.sendSuccessResponse({ message: __("Capability updated successfully."), data: capability }, res);
    } catch (error) {
        logger.error(req.logAction, "Error updating Capability", "ERROR" + ":" + error, "STACK" + ":" + error.stack);
        error.error_description = "Capability Controller";
        return utils.sendErrorResponse(error, res);
    }
};

exports.listCapabilities = async (req, res) => {
    try {
        const capabilities = await capabilityService.findList();
        return utils.sendSuccessResponse({ message: __("Capabilities fetched successfully."), data: capabilities }, res);
    } catch (error) {
        console.error("Error fetching capabilities:", error);
        logger.error(req.logAction, "Error fetching capabilities", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Capability Controller";
        return utils.sendErrorResponse(error, res);
    }
};

exports.deleteCapability = async (req, res) => {
    try {
        const { _id } = req.params;
        console.log("_id=======>",_id)
        const capability = await capabilityService.remove({_id:_id});
        if (!capability) {
            return utils.sendErrorResponse({ message: __("Capability not found.") }, res);
        }

        return utils.sendSuccessResponse({ message: __("Capability deleted successfully.") }, res);
    } catch (error) {
        console.error("Error deleting capability:", error);
        logger.error(req.logAction, "Error deleting capability", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Capability Controller";
        return utils.sendErrorResponse(error, res);
    }
};

exports.getCapabilityById = async (req, res) => {
    try {
        const { _id } = req.params;

        const capability = await capabilityService.findOne({
            _id: _id,
            status: {
                $ne: 'deleted'
            }
        });
        if (!capability) {
            return utils.sendErrorResponse({ message: __("Capability not found.") }, res);
        }

        return utils.sendSuccessResponse({ message: __("Capability fetched successfully."), data: capability }, res);
    } catch (error) {
        console.error("Error fetching capability by ID:", error);
        logger.error(req.logAction, "Error fetching capability by ID:", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Capability Controller";
        return utils.sendErrorResponse(error, res);
    }
};

