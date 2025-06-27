const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { getParameter } = require('../lib/ssm');

module.exports.sendEmail = async (to, subject, message) => {
    return new Promise(async (resolve, reject) => {
        try {

            const accessKeyId = await getParameter("Vital_Tech_Bucket_AK");
            const secretAccessKey = await getParameter("Vital_Tech_Bucket_SEK");
            const Source = await getParameter("Vital_Tech-SES-Email");
            const region = await getParameter('Vital_Tech_Bucket_Region');

            console.log("====13=====", accessKeyId)
            console.log("====14=====", secretAccessKey)
            console.log("====15=====", Source)
            console.log("====16=====", region)

            const client = new SESClient({
                region,
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                }
            });

            const sendEmailParams = {
                Source,
                Destination: {
                    ToAddresses: [to],
                },
                Message: {
                    Body: {
                        Html: {
                            Data: message,
                        },
                    },
                    Subject: {
                        Data: subject,
                    },
                },
            };
            const sendEmailCommand = new SendEmailCommand(sendEmailParams);
            client.send(sendEmailCommand)
            .then((data) => {
                console.log("Email sent successfully: ", data.MessageId);
                return resolve(data);
            })
            .catch((error) => {
                console.error("Error sending email: ", error);
                return resolve(error);
            });
        }
        catch (err) {
            console.log("Error sending email:",err);
            return reject(err);
        }
    });
}