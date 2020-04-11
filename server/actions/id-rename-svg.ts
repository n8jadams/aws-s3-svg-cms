import { extendedGlobal } from '../extended-global'
import { S3_BUCKET_NAME } from '../consts/env'
import { SOURCE_SVGS_FOLDER } from '../consts/source-svgs-folder'

export async function idRenameSvg({id, idFromS3}: IDRenameSvgPayload): Promise<void> {
	const { s3 } = extendedGlobal
	const oldKey = `${SOURCE_SVGS_FOLDER}${idFromS3}.svg`
	const newKey = `${SOURCE_SVGS_FOLDER}${id}.svg`

	// Copy the object to a new location
	try {
		await s3.copyObject({
			Bucket: S3_BUCKET_NAME, 
			CopySource: `${S3_BUCKET_NAME}/${oldKey}`,
			Key: newKey,
			ACL: 'public-read'
		}).promise()
		await s3.deleteObject({
			Bucket: S3_BUCKET_NAME, 
			Key: oldKey
		}).promise()
	} catch(e) {
		throw new Error(e)
	}
}