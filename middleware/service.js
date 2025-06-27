const userModel = require('../models/userModel');

module.exports = {
    findUser: async (search) => {
        return await userModel.findOne(search);
    }
}