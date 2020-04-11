import AWS from 'aws-sdk/global'
import S3 from 'aws-sdk/clients/s3'
import { extendedGlobal } from './extended-global'

AWS.config.update({
	region: process.env.AWS_DEFAULT_REGION,
})

extendedGlobal.s3 = new S3({
	apiVersion: '2006-03-01',
	params: { Bucket: process.env.S3_BUCKET_NAME }
})