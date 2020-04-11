import React from 'react'
import ReactDOM from 'react-dom'
import AWS from 'aws-sdk/global'
import S3 from 'aws-sdk/clients/s3'
import { extendedWindow } from './extended-window'
import { AWS_REGION, AWS_IDENTITY_POOL_ID, S3_BUCKET_NAME } from './consts/env'
import { SvgCmsApp } from './svg-cms-app'

// Initialize the Amazon Cognito credentials provider
AWS.config.update({
	// @ts-ignore
	region: AWS_REGION,
	credentials: new AWS.CognitoIdentityCredentials({
		// @ts-ignore
		IdentityPoolId: AWS_IDENTITY_POOL_ID
	})
})

extendedWindow.s3 = new S3({
	apiVersion: '2006-03-01',
	// @ts-ignore
	params: { Bucket: S3_BUCKET_NAME }
})

ReactDOM.render(<SvgCmsApp />, document.getElementById('root'))