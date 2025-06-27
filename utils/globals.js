const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

let sendErrorResponse = function (err, res) {
    return res.status(err.status_code || 400)
        .send({
            "status": "failure",
            "status_code": err.status_code || 400,
            message: err.message,
            error_description: err.error_description || '',
            data: err.data || {}
        });
};

let sendSuccessResponse = function (result, res, other) {
    let sendData = {
        "status": "success",
        "status_code": result.status_code || 200,
        message: result.message || 'SUCCESS!',
        data: result.data || {},
        totalcount: result.count || 0
    };
    sendData = { ...sendData, ...other };
    return res.status(result.status_code || 200).send(sendData);
};

let generateOTP = (codelength) => {
    return Math.floor(Math.random() * (Math.pow(10, (codelength - 1)) * 9)) + Math.pow(10, (codelength - 1));
};

let generatorRandomNumber = async (length=2) => {
   
    var token = "";
    var possible = "123456789";
    for (var i = 0; i < length; i++)
        token += possible.charAt(Math.floor(Math.random() * possible.length));
    return token;
};

// "DD-MM HH:mm:ss.SSS"
const getLoggingTime = () => {
    let date = new Date();
    return pad(date.getUTCMonth() + 1)
        + '-' + pad(date.getUTCDate())
        + ' ' + pad(date.getUTCHours())
        + ':' + pad(date.getUTCMinutes())
        + ':' + pad(date.getUTCSeconds())
        + '.' + String((date.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5);
}

const pad = (number) => {
    var r = String(number);
    if (r.length === 1) {
        r = '0' + r;
    }
    return r;
}
const hashPassword = async (password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
};
const verifyPassword = async (hashedPassword, password) => {
    const validPassword = await bcrypt.compare(password, hashedPassword);
    return validPassword;
};
const generateToken = async (user, expiresIn = '15d') => {
    // console.log("tokenExpiresIn:", expiresIn)
    return jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        global.env.JWT_SECRET,
        { expiresIn: expiresIn }
    );
};
const verifyToken = (token) => {
    return jwt.verify(
        token,
        global.env.JWT_SECRET
    );
};

const setForgotPasswordEmail = async (user, otp) => {
    const templatePath = "../templates/index.html";
    const compiledHTLMCustomer = ejs.compile(
        fs.readFileSync(path.join(__dirname, templatePath), "utf8")
    );

    let body = compiledHTLMCustomer({
        text: `Hello ${user.email || user}, <br />
               <br /> Your Reset Password Activation Code for Vital tech rhino is ${otp}. <br />
               <br />`
    });
    return body;
}


module.exports = {
    sendErrorResponse,
    sendSuccessResponse,
    generateOTP,
    generatorRandomNumber,
    getLoggingTime,
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    setForgotPasswordEmail
}