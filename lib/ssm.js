const AWS = require('aws-sdk');
let config = {};
if(env?.AWS_SSM_ACCESS_KEY && env?.AWS_SSM_ACCESS_SECRATE){
    config = {
        region: "us-east-2",
        credentials: {
            accessKeyId: env.AWS_SSM_ACCESS_KEY,
            secretAccessKey: env.AWS_SSM_ACCESS_SECRATE,
        }
    } 
} else {
    config = { region: "us-east-2" }
}
const ssm = new AWS.SSM(config);

exports.getParameter = async (key) => {
    try {
        const params = {
            "Name": key,
            "WithDecryption": true
        };
        const data = await ssm.getParameter(params).promise();
        return data.Parameter.Value;

    } catch (err) {
        console.log("SSM get paraments error", err);
    }
}
