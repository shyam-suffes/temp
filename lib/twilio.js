const twilio = require('twilio');
var credentials = {
    AccountSid: env?.ACCOUNTSID,
    AuthToken: env?.AUTHTOKEN,
    TwilioFrom: env?.TWILIOPHONENUMBER,
};

exports.sendTwilioMessage = async (countryCode, phoneNumber, message) => {
    try {
        const client = new twilio(credentials.AccountSid, credentials.AuthToken);        
        await client.messages.create({
            from: credentials.TwilioFrom,
            to: `+${countryCode} ${phoneNumber}`,
            body: message,
        });

    } catch (error) {
        console.error("Error sending Twilio message:", error.message);
    }
};