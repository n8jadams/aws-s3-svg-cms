import S3 from 'aws-sdk/clients/s3'

import { S3_BUCKET_NAME } from '../consts/env'
import { SOURCE_SVGS_FOLDER } from '../consts/source-svgs-folder'
import { filterSvgTopLevelDimensions } from '../utils/filter-svg-top-level-dimensions'

export async function addSvg({id, body}: AddSvgPayload): Promise<void> {
	const newKey = `${SOURCE_SVGS_FOLDER}${id}.svg`

	// Remove top level dimention attributes and convert string to Buffer
	const Body = Buffer.from(filterSvgTopLevelDimensions(body), 'utf-8')

	try {
		await new S3.ManagedUpload({
			params: {
				Bucket: S3_BUCKET_NAME,
				Key: newKey,
				Body,
				ContentType: 'image/svg+xml',
				ACL: 'public-read'
			}
		}).promise()
	} catch(e) {
		throw new Error(e)
	}
}