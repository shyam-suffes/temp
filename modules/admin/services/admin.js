const userModel = require('../../../models/userModel');

module.exports = {
    findUsers: async (search) => {
        return await userModel.find(search);
    },
    findOneUser: async (search) => {
        return await userModel.findOne(search);
    },
    updateUser: async (find, data) => {
        return await userModel.findOneAndUpdate(find, data, { new: true });
    },
    createUser: async (data) => {
        return await userModel.create(data);
    },
}