const { S3 } = require("aws-sdk");

const uuid = require("uuid").v4;
require("dotenv").config();

//for SIgnature upload
exports.signatureUpload = async (bufferSign, extSign) => {
  const sign = new S3();
  const param = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `zydus/poc/signature/${uuid()}.${extSign}`,
    Body: bufferSign,
  };
  return await sign.upload(param).promise()
};