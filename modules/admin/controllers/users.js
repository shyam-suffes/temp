'use strict'
const utils = require('../../../utils/globals');
const service = require('../services/users');
const logger = require('../../../config/logger');

exports.list = async(req,res)=>{
    try {
           let data = req.body;
                var pageSize = data.limit || 10;
                var sortByField = data.orderBy || "createdAt";
                var sortOrder = data.order || -1;
                var pageNo = data.pageNo || 1;
        
                let obj = {};
        
                if (data.fieldName && data.fieldValue) {
                    if (data.fieldName === "isSubscribed") {
                        // Convert string "true"/"false" to actual Boolean values
                        obj[data.fieldName] = data.fieldValue === "true";
                    } else {
                        obj[data.fieldName] = { $regex: data.fieldValue.trim(), $options: 'i' };
                    }
                }
        
                if (data.search) {
                    data.search = data.search.trim();
                    obj['$or'] = [{
                        "name": { $regex: data.search || '', $options: 'i' }
                    }, {
                        "email": { $regex: data.search || '', $options: 'i' }
                    },
                    {
                        "status": { $regex: data.search || '', $options: 'i' }
                    },
                    {
                        "phoneNo": { $regex: data.search || '', $options: 'i' }
                    }
                ];
                }
                if (data.status) {
                    obj.status = data.status
                }
                
                obj.role = {$ne:"admin"}
                
                let count = await service.countData(obj);
                let aggregateList = await service.aggregateList(obj, sortByField, sortOrder, pageNo, pageSize);
                if (aggregateList.length == 0) {
                    return utils.sendSuccessResponse({ message: __("USER_LIST_EMPTY"), data: [], count: 0 }, res);
                };
                return utils.sendSuccessResponse({ message: __("USER_LIST_SUCCESS"), data: aggregateList, count: count }, res);
    } catch (error) {
          logger.error(req.logAction, "Admin user list error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
                error.error_description = "Admin Users Controller";
                return utils.sendErrorResponse(error, res);
    }
}

exports.getUserById = async(req,res)=>{
    try {
        const userDetail = await service.findOne({
            _id: req.params._id,
            status: {
                $ne: 'deleted'
            }
        });
        if (!userDetail) {
            return utils.sendErrorResponse({ message: __("USER_NOT_FOUND"), data: {} }, res);
        }

        return utils.sendSuccessResponse({ message: __("USER_DETAILS_SUCCESS"), data: userDetail }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Admin userDetail get by id error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Admin User controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.edit = async (req, res) => {
    try {
        let data = req.body;
        let userExist = await service.findOne({ _id: req.params._id });

        if (!userExist) {
            return utils.sendErrorResponse({ message: __("ACCOUNT_DOES_NOT_EXIST"), data: {} }, res);
        }

       

        // if (data.languageId) {
        //     data.languageId = data.languageId
        // }

        const user = await service.updateOne({ _id: userExist._id }, { $set: data });

        return utils.sendSuccessResponse({ message: __("PROFILE_UPDATE_SUCCESS"), data: user }, res);
    } catch (error) {
        logger.error(req.logAction, "Admin User edit error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Admin User edit controller";
        return utils.sendErrorResponse(error, res);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        let user = await service.findOne({ _id: req.params._id });
        console.log("user====>",user)
        if (!user) {
            return utils.sendErrorResponse({ message: __("USER_NOT_EXIST") });
        }

        await service.updateOne({
            _id: user._id
        }, {
            $set: {
                status: "deleted"
            }
        });
        return utils.sendSuccessResponse({ message: __("USER_REMOVE_SUCCESS"), data: {} }, res);
    }
    catch (error) {
        logger.error(req.logAction, "Admin User remove error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Admin User controller";
        return utils.sendErrorResponse(error, res);
    }
}