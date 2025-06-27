const model = require('../../../models/faqModel');

module.exports = {
    findFaq: async (find) => {
        return await model.findOne(find);
    },
    countData: async (find) => {
        return await model.countDocuments(find);
    },
    findAggregateList: async (obj, sortByField, sortOrder, pageNo, pageSize) => {
        return await model.aggregate([
            { $match: obj },
            { $sort: { [sortByField]: parseInt(sortOrder) } },
            { $skip: (pageNo - 1) * pageSize },
            { $limit: parseInt(pageSize) }
        ]);
    },
    createFaq: async (data) => {
        return await model.create(data);
    },
    removeFaq: async (find) => {
        return await model.findOneAndDelete(find);
    },
    updateFaq: async (find, data) => {
        return await model.findOneAndUpdate(find, data, { new: true });
    }
}