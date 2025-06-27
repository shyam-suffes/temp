'use strict'
const utils = require('../../../utils/globals');
const service = require('../services/faq');
const logger = require('../../../config/logger');

exports.add = async (req, res) => {
    try {
        let data = req.body;

        const faq = await service.createFaq(data);
        return utils.sendSuccessResponse({ message: __("ADD_SUCCESS"), data: faq }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Faq Add error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Faq controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.edit = async (req, res) => {
    try {
        let data = req.body;
        let faq = await service.findFaq({ _id: data._id });

        if (!faq) {
            return utils.sendErrorResponse({ message: __("NOT_FOUND"), status_code: 404, data: {} }, res);
        }
        faq = await service.updateFaq({ _id: data._id }, { $set: data });
        return utils.sendSuccessResponse({ message: __("ADD_SUCCESS"), data: faq }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Faq Edit error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Faq controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.view = async (req, res) => {
    try {
        let data = req.body;
        let faq = await service.findFaq({ _id: data._id });

        if (!faq) {
            return utils.sendErrorResponse({ message: __("NOT_FOUND"), status_code: 404, data: {} }, res);
        }
        return utils.sendSuccessResponse({ message: __("SUCCESS"), data: faq }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Faq View error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Faq controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.remove = async (req, res) => {
    try {
        let data = req.body;
        let faq = await service.findFaq({ _id: data._id });

        if (!faq) {
            return utils.sendErrorResponse({ message: __("NOT_FOUND"), status_code: 404, data: {} }, res);
        }
        await service.updateFaq({ _id: faq._id },{
            status: "deleted"
        });
        return utils.sendSuccessResponse({ message: __("REMOVE_SUCCESS"), data: {} }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Faq Remove error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Faq controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.list = async (req, res) => {
    try {
        let data = req.body;
        console.log("data======>",data)
        var pageSize = data.limit || 10;
        var sortByField = data.orderBy || "createdAt";
        var sortOrder = data.order || -1;
        var pageNo = data.pageNo || 1;

        let obj = {};

        if (data.fieldName && data.fieldValue) {
            obj[data.fieldName] = { $regex: data.fieldValue || '', $options: 'i' };
        }

        if (data.search) {
            data.search = data.search.trim();
            obj['$or'] = [{
                question: { $regex: data.search || '', $options: 'i' }
            }, {
                answer: { $regex: data.search || '', $options: 'i' }
            }];

        }
        console.log("data.status==>",data.status)
        if (data.status) {
            obj.status = data.status
            console.log("Obj=======>",obj)
        }else {
            obj.status = 'active'
        }
        const count = await service.countData(obj);
        const faqs = await service.findAggregateList(obj, sortByField, sortOrder, pageNo, pageSize);

        if (!faqs.length) {
            return utils.sendErrorResponse({ message: __("NOT_FOUND"), status_code: 404, data: [] }, res);
        }
        return utils.sendSuccessResponse({ message: __("SUCCESS"), data: faqs, count: count }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Faq list error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Faq controller";
        return utils.sendErrorResponse(error, res);
    }
}