import fetch from 'isomorphic-unfetch'

import { extendedGlobal } from '../extended-global'
import { deriveFileExtension } from '../utils/derive-file-extension'
import { filterSvgTopLevelDimensions } from '../utils/filter-svg-top-level-dimensions'
import { SOURCE_SVGS_FOLDER } from '../consts/source-svgs-folder'
import { S3_BUCKET_BASE_URL } from '../consts/env'

interface S3BucketType {
	Key: string
}

export async function fetchSourceSvgs(includeBody:boolean = false): Promise<Svg[]> {
	try {
		const dataContents = await extendedGlobal.s3
			.listObjectsV2({ Delimiter: '/', Prefix: SOURCE_SVGS_FOLDER })
			.promise()
			.then((data) =>
				data.Contents.filter(
					({ Key }: S3BucketType) =>
						Key !== SOURCE_SVGS_FOLDER && deriveFileExtension(Key) === 'svg'
				).sort((a: S3BucketType, b: S3BucketType) => a.Key < b.Key ? -1 : 1)
			)
		return await Promise.all(
			dataContents.map(async (c: S3BucketType) => {
				const id = c.Key.replace(SOURCE_SVGS_FOLDER, '').replace('.svg', '').toLowerCase()
				const fetchResult = await fetch(
					`${S3_BUCKET_BASE_URL}${c.Key}`
				)
				const svgWithPotentialDimensions = await fetchResult.text()
				const svgWithoutDimensions = filterSvgTopLevelDimensions(svgWithPotentialDimensions)
				const svgAsBase64 = Buffer.from(svgWithoutDimensions).toString('base64')

				let svg: Svg = {
					id,
					url: `data:image/svg+xml;base64,${svgAsBase64}`,
				}

				if(includeBody) {
					svg = { ...svg, body: svgWithoutDimensions }
				}

				return svg
			})
		)
	} catch (e) {
		throw new Error(e)
	}
}