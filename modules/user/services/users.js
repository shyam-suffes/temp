const userModel = require('../../../models/userModel');
const phoneModel = require('../../../models/phoneModel');
const emailModal = require('../../../models/emailModal');

const questionModel = require('../../../models/questionModel');

module.exports = {
    createUser: async (data) => {
        return await userModel.create(data);
    },
    findUsers: async (search) => {
        return await userModel.find(search);
    },
    findOneUser: async (search) => {
        return await userModel.findOne(search);
    },
    updateUser: async (find, data) => {
        return await userModel.findOneAndUpdate(find, data, {upsert: true,new: true});
    },
    createPhone: async (find, data) => {
        return await phoneModel.findOneAndUpdate(find, data, { upsert: true, new: true });
    },
    createEmail: async (find, data) => {
        return await emailModal.findOneAndUpdate(find, data, { upsert: true, new: true });
    },
    findPhone: async (find) => {
        return await phoneModel.findOne(find);
    },
    findEmail: async (find) => {
        return await emailModal.findOne(find);
    },
    questions: async (find) => {
        return await questionModel.find(find);
    }
}