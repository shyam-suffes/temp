'use strict'
const userModel = require('../../../models/userModel');

module.exports = {
    findOne: async (data) => {
        return await userModel.findOne(data)
    },
    findSubAdmin:async(data)=>{
        return await userModel.findOne(data).select('-authToken -password').populate('permissionId')
    },
    findOneWithDetails: async(data)=>{
        return await userModel.findOne(data)
        .select('-firebaseToken -authToken -password')
        .populate({
            path: 'languageId',
            model: 'language'
        })
        .populate({
            path: "currentPlan",
            populate: [
                { path: "subscriptionPlanId", model: "subscriptionPlan" },
            ]
        });
    },
    find: async (data) => {
        return await userModel.find(data);
    },
    createOne: async (data) => {
        return await userModel.create(data);
    },
    updateById: async (id, data) => {
        return await userModel.findByIdAndUpdate(id, data, { new: true });
    },
    findAndUpdate: async (find, data) => {
        return await userModel.findOneAndUpdate(find, data, { new: true, upsert: true });
    },
    getData: async (current_page, row_per_page, obj = {}) => {
        const documentToSkip = row_per_page * (((current_page > 0 && current_page) || 1) - 1);
        return await userModel.find(obj)
            .sort({ dateCreated: -1 })
            .skip(documentToSkip)
            .limit(row_per_page);
    },
    list: async (obj = {}) => {
        return await userModel.find(obj)
    },
    countData: async (obj = {}) => {
        return await userModel.countDocuments(obj);
    },
    aggregateList: async(obj, sortByField, sortOrder, pageNo, pageSize) => {
        return await userModel.aggregate([
            { $match: obj },
            { $sort: { [sortByField]: parseInt(sortOrder) } },
            { $skip: (pageNo - 1) * pageSize },
            { $limit: parseInt(pageSize) },
            {$project:{"password":0,"salt":0,"authToken":0,"firebaseToken":0}}
        ]);
    }
}