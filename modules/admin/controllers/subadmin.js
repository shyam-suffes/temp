'use strict'
const utils = require('../../../utils/globals');
const service = require('../services/subadmin');
const permissionService = require('../services/permission');

const logger = require('../../../config/logger');




exports.createSubAdmin = async (req, res) => {
    try {
        let data = req.body;
        const email = data.email.toLowerCase();

        let userExist = await service.findOne({
            email: email,
            status: { $in: ['inactive', 'deleted', 'blocked', 'active'] },
            role: 'subAdmin'
        });

        if (userExist) {
            let userStatus = userExist.status;
            return utils.sendErrorResponse({ 
                message: __(`ACCOUNT_ALREADY_EXIST_AND_STATUS_IS_${userStatus}`), 
                data: {} 
            }, res);
        }

        // Hash password
        let getHash = await utils.hashPassword(data.password);
        data.password = getHash.hashedPassword;
        data.salt = getHash.salt;
        data.role = 'subadmin';
        data.status='active';
        // Create SubAdmin User
        let subAdmin = await service.createOne(data);

        // Convert permissions object to array format
        let permissionsArray = Object.entries(data.permissions || {}).map(([page, access]) => ({
            page,
            write: access.write || false,
            edit: access.edit || false,
            view: access.view || false,
            delete: access.delete || false,

        }));

        // Create Permission Document
        let newPermission = await permissionService.createOne({
            userId: subAdmin._id,
            permissions: permissionsArray
        });

        // Link permission to subAdmin
        subAdmin.permissionId = newPermission._id;
        await subAdmin.save();

        return utils.sendSuccessResponse({
            message: __("SUBADMIN_CREATED_SUCCESSFULLY"),
            data: subAdmin
        }, res);

    } catch (error) {
        logger.error(req.logAction, "Admin Create SubAdmin error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "Admin SubAdmin Controller";
        return utils.sendErrorResponse(error, res);
    }
};


exports.list = async(req,res)=>{
    try {
         let data = req.body;
                var pageSize = data.limit || 10;
                var sortByField = data.orderBy || "dateCreatedUtc";
                var sortOrder = data.order || -1;
                var pageNo = data.pageNo || 1;
        
                let obj = {};
        
                if (data.fieldName && data.fieldValue) {
                    obj[data.fieldName] = { $regex: data.fieldValue || '', $options: 'i' };
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
                        "role": { $regex: data.search || '', $options: 'i' }
                    }];
                }
        
                if (data.status) {
                    obj.status = data.status
                }
        
                if (data.role) {
                    obj.role = obj.role
                }
                else {
                    obj.role = 'subAdmin'
                }
                // obj.permissionId = {$ne:null}
                console.log("obj=====>",obj)
                let count = await service.countData(obj);
                let aggregateList = await service.aggregateList(obj, sortByField, sortOrder, pageNo, pageSize);
                if (aggregateList.length == 0) {
                    return utils.sendSuccessResponse({ message: __("ADMIN_LIST_EMPTY"), data: [], count: 0 }, res);
                };
                return utils.sendSuccessResponse({ message: __("ADMIN_LIST_SUCCESS"), data: aggregateList, count: count }, res);
    } catch (error) {
        console.log("error====>",error)
        logger.error(req.logAction, "SubAdmin list error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        error.error_description = "SubAdmin Controller";
        return utils.sendErrorResponse(error, res);
    }
}

exports.getSubAdmin = async (req, res) => {
    try {
        const userId = req.params._id;
        if (!userId) {
            return utils.sendErrorResponse({ message: __("NOT_A_VALID_ID"), data: {} }, res);
        }

        // Fetch subadmin with permissions populated
        const subAdminData = await service.findSubAdmin({ _id: userId });

        if (!subAdminData) {
            return utils.sendErrorResponse({ message: __("SUBADMIN_NOT_FOUND") }, res);
        }

        let filteredPermissions = [];

        // Filter out permissions where all values are false
        if (subAdminData.permissionId && subAdminData.permissionId.permissions) {
            filteredPermissions = subAdminData.permissionId.permissions.filter(perm => 
                perm.write || perm.edit || perm.view || perm.delete
            );
        }

        // Attach transformed permissions array to response
        const responseData = {
            ...subAdminData.toObject(),
            permissionId: {
                ...subAdminData.permissionId.toObject(),
                permissions: filteredPermissions // ✅ Filtered array
            }
        };

        return utils.sendSuccessResponse({ message: __("SUBADMIN_DATA"), data: responseData }, res);
    } catch (error) {
        console.log("erro----->", error);
        logger.error(req.logAction, "SubAdmin get profile error", 
            "ERROR: " + error.message, 
            "STACK: " + error.stack
        );
        error.error_description = "SubAdmin Controller";
        return utils.sendErrorResponse(error, res);
    }
};



exports.editSubAdmin = async (req, res) => {
    try {
        let data = req.body;
        let subAdmin = await service.findOne({ _id: req.params._id, role: "SubAdmin" });

        if (!subAdmin) {
            return utils.sendErrorResponse({ message: __("SUBADMIN_DOES_NOT_EXIST"), data: {} }, res);
        }

        // Prevent password updates here
        if (data.password) {
            delete data.password;
            delete data.salt;
        }

        // Handle Permissions Update
        if (data.permissions) {
            let permissionsArray = Object.entries(data.permissions).map(([page, access]) => ({
                page,
                write: access.write || false,
                edit: access.edit || false,
                view: access.view || false,
                delete: access.delete || false,
            }));

            let existingPermission = await permissionService.findOne({ userId: subAdmin._id });

            if (existingPermission) {
                // Update existing permission
                await permissionService.findAndUpdate(
                    { userId: subAdmin._id },
                    { $set: { permissions: permissionsArray } }
                );
            } else {
                // Create new permission entry
                let newPermission = await permissionService.createOne({
                    userId: subAdmin._id,
                    permissions: permissionsArray
                });

                // Link permission to subAdmin
                subAdmin.permissionId = newPermission._id;
                await subAdmin.save();
            }

            delete data.permissions;
        }

        // Update SubAdmin details
        const updatedSubAdmin = await service.findAndUpdate({ _id: subAdmin._id }, { $set: data });

        return utils.sendSuccessResponse({ message: __("SUBADMIN_UPDATED_SUCCESSFULLY"), data: updatedSubAdmin }, res);
    } catch (error) {
        logger.error(req.logAction, "SubAdmin Edit error", 
            "ERROR" + ":" + error.message, 
            "STACK" + ":" + error.stack
        );
        error.error_description = "SubAdmin Edit controller";
        return utils.sendErrorResponse(error, res);
    }
};

