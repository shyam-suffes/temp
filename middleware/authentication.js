const service = require("./service");
const mongoose = require('mongoose');
const utils = require('../utils/globals');

const authUser = async (req, res, next) => {
    try {
        const authorizationHeader = req.get('Authorization');
        if (!authorizationHeader) {
            return utils.sendErrorResponse({ message:__("AUTHORIZATION_TOKEN_IS_REQUIRED"), status_code: 401 }, res);
        }

        const token = authorizationHeader.replace('Bearer ', '');
        const decodedToken = utils.verifyToken(token);

        const user = await service.findUser({
            _id: new mongoose.Types.ObjectId(decodedToken.id),
            status: { $ne: "deleted" },
            authToken: token,
            // role:"user"
        });
        if (!user || (user?.authToken && user?.authToken !== token)) {
            return utils.sendErrorResponse({ message: __("NOT_AUTHORIZED"), status_code: 401}, res);
        }
        if (user.status === "blocked") {
            return utils.sendErrorResponse({ message: __("ACCOUNT_BLOCKED") }, res);
        }
        if (user?.status === "inactive") {
            return utils.sendErrorResponse({ message: __("ACCOUNT_INACTIVE"), data: {} }, res);
        }

        req.user = user;
        req.token = token;
        req.role = user.role;
        
        next();
    } 
    catch (error) {
        utils.sendErrorResponse({ message:__("INVALID_TOKEN") }, res);
    }
};
const authenticateAdmin = async (req, res, next) => {
    try {
        const authorizationHeader = req.get('Authorization');
        if (!authorizationHeader) {
            return utils.sendErrorResponse({ message: __("AUTHORIZATION_TOKEN_IS_REQUIRED") }, res);
        }

        const token = authorizationHeader.replace('Bearer ', '');
        const decodedToken = utils.verifyToken(token);

        if (!decodedToken || !decodedToken.id) {
            return utils.sendErrorResponse({ message: __("INVALID_TOKEN") }, res);
        }

        const adminConditions = {
            _id: new mongoose.Types.ObjectId(decodedToken.id),
            status: { $ne: "deleted" },
            authToken: token,
            $or: [{ role: "admin" }, { role: "subAdmin" }]
        };

        const admin = await service.findUser(adminConditions);

        if (!admin) {
            return utils.sendErrorResponse({ message: __("NOT_AUTHORIZED"), status_code: 401 }, res);
        }
        if (admin.status === "blocked") {
            return utils.sendErrorResponse({ message: __("ACCOUNT_BLOCKED") }, res);
        }


        req.admin = admin;
        req.token = token;
        next();
    } catch (error) {
        console.log("error", error);
        utils.sendErrorResponse({ message: __("INVALID_TOKEN") }, res);
    }
};
module.exports = { authUser,authenticateAdmin };