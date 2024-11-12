export const BUCKET_NAME = 'gallery';
export const ORIGINALS_FOLDER = 'originals';
export const THUMBNAILS_FOLDER = 'thumbnails';

export const COMMENTS_LIMIT = 10;
export const IMAGES_LIMIT = 20;

export const BUCKET_POLICY = {
  Version: '2012-10-17',
  Statement: [
    {
      Action: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
      Effect: 'Allow',
      Principal: '*',
      Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
    },
  ],
};
