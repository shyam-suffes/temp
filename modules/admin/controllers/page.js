'use strict'
const utils = require('../../../utils/globals');
const service = require('../services/page');
const logger = require('../../../config/logger');

exports.add = async (req, res) => {
    try {
        let data = req.body;
        let page = await service.findPage({type: data.type});
        if (page) {
            return utils.sendErrorResponse({ message: __("ALREADY_EXIST"), data: {} }, res);
        }

        page = await service.createPage( data );
        return utils.sendSuccessResponse({ message: __("ADD_SUCCESS"), data: page }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Page Add error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Page controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.edit = async (req, res) => {
    try {
        let data = req.body;

        const page = await service.updatePage({ _id:req.params._id }, { $set: data });
        return utils.sendSuccessResponse({ message: __("SUCCESS"), data: page }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Page Edit error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Page controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.view = async (req, res) => {
    try {
        let data = req.body;
        let page = await service.findPage({ _id: data._id });

        if (!page) {
            return utils.sendErrorResponse({ message: __("NOT_FOUND"), status_code: 404, data: {} }, res);
        }
        return utils.sendSuccessResponse({ message: __("SUCCESS"), data: page }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Page View error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Page controller";
        return utils.sendErrorResponse(error, res);
    }
}

// exports.list = async (req, res) => {
//     try {
//         const pages = await service.findList();

//         if (!pages.length) {
//             return utils.sendErrorResponse({ message: __("NOT_FOUND"), status_code: 404, data: [] }, res);
//         }
//         return utils.sendSuccessResponse({ message: __("SUCCESS"), data: pages }, res);
//     }
//     catch (error) {
//         logger.error(req.logAction, "Page list error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
//         error.error_description = "Page controller";
//         return utils.sendErrorResponse(error, res);
//     }
// }

exports.remove = async (req, res) => {
    try {
        const data = req.body;
        const page = await service.findPage({_id: data._id});

        if (!page) {
            return utils.sendErrorResponse({ message: __("NOT_FOUND"), status_code: 404, data: {} }, res);
        }
        await service.updatePage({_id: page._id},{
            status: "deleted"
        });
        return utils.sendSuccessResponse({ message: __("REMOVE_SUCCESS"), data: {} }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Page Remove error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Page controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.getPageByName = async (req, res) => {
    try {
        const { type } = req.params;
        let languageCode = req.headers['accept-language'] || 'en'; 
        languageCode = languageCode.split(',')[0].split('-')[0].trim();
        if (!['en', 'es'].includes(languageCode)) {
            languageCode = 'en';
        }

        let page = await service.findPage({ "type": type.trim() , languageCode});
        if (!page) {
            return utils.sendErrorResponse({ message: __("PAGE_NOT_EXIST") }, res);
        }

        return utils.sendSuccessResponse({ message: __("PAGE_DETAILS_SUCCESS"), data: page.description }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Page detail error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Page controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.list = async (req, res) => {
    try {
        let data = req.body;
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
                type: { $regex: data.search || '', $options: 'i' }
            }, {
                description: { $regex: data.search || '', $options: 'i' }
            }];

        }
        if (data.status) {
            obj.status = data.status
        }
        else {
            obj.status = 'active'
        }
        if(data.languageCode){
            obj.languageCode=data.languageCode
        }
        let count = await service.countData(obj);
        let aggregateList = await service.aggregateList(obj, sortByField, sortOrder, pageNo, pageSize);
        if (aggregateList.length == 0) {
            return utils.sendSuccessResponse({ message: __("PAGE_LIST_EMPTY"), data: [], count: 0 }, res);
        };
        return utils.sendSuccessResponse({ message: __("PAGE_LIST_SUCCESS"), data: aggregateList, count: count }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Page list error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Page controller";
        return utils.sendErrorResponse(error, res);
    }
}