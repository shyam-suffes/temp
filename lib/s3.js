const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getParameter } = require('./ssm');

var storageObj = async () => {
    const accessKeyId = await getParameter('Vital_Tech_Bucket_AK');
    const secretAccessKey = await getParameter('Vital_Tech_Bucket_SEK');
    const region = await getParameter('Vital_Tech_Bucket_Region');
    
    const obj = new S3Client({
        region,
        credentials: {
            accessKeyId,
            secretAccessKey,
        }
    });
    return obj;
}

module.exports.uploadImageDataToS3 = async (imageData) => {
    return new Promise(async (resolve, reject) => {

        try {
            console.log("imageData", imageData);
            var ss = Date.now().toString();
            const type = imageData.mimetype.split('/')[1];
            const Bucket = await getParameter('Vital_Tech_Bucket_Name');
            const putObjectCommand = new PutObjectCommand({
                Bucket,
                Key: `${ss}.${type}`,
                Body: imageData.buffer,
                ACL: 'public-read',
                ContentEncoding: 'base64',
                ContentType: imageData.mimetype
            });
            const s3 = await storageObj();
            s3.send(putObjectCommand)
                .then((data) => {
                    console.log("Successfully uploaded data to S3", data);
                    return resolve({ location: `${ss}.${type}`, baseUrl: `https://${Bucket}.s3.amazonaws.com/` });
                })
                .catch((error) => {
                    console.error("Error uploading data to S3", error);
                    return reject(error);
                });
        }
        catch (error) {
            console.log(error);
            return reject(error, null);
        }
    });
};
