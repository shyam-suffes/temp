
const model = require('../../../models/userModel');

module.exports = {
    findOne: async (find) => {
        return await model.findOne(find);
    },
    createOne: async (data) => {
        return await model.create(data);
    },
    findList: async () => {
        return await model.find();
    },
    updateOne: async (find, data) => {
        return await model.findOneAndUpdate(find, data, { upsert: true, new: true });
    },
    remove: async (find) => {
        return await model.findOneAndDelete(find);
    },
    aggregateList: async (obj, sortByField, sortOrder, pageNo, pageSize) => {
        return await model.aggregate([
            { $match: obj },
            { $sort: { [sortByField]: parseInt(sortOrder) } },
            { $skip: (pageNo - 1) * pageSize },
            { $limit: parseInt(pageSize) }
        ]);
    },
    countData: async (obj = {}) => {
        return await model.countDocuments(obj);
    },
}