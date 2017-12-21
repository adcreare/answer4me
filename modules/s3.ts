import S3 = require('aws-sdk/clients/s3');
const s3 = new S3({region: 'us-east-1'});

export async function uploadFileToS3(bucket, keyprefix, filename, file){

  const params = {
    Body: file,
    Bucket: bucket,
    Key: keyprefix + '/' + filename
   };

  return s3.putObject(params).promise();
}

export function getSigngedURL(bucket, keyprefix, filename): string
{
  const key: string = keyprefix + '/' + filename;
  const params = {Bucket: bucket, Key: key, Expires: 4000};

  const url: string = s3.getSignedUrl('getObject', params);

  return url;

}
