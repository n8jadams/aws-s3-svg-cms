import { extendedGlobal } from '../extended-global'
import { SOURCE_SVGS_FOLDER } from '../consts/source-svgs-folder'

export async function deleteSvg({ id }: DeleteSvgPayload): Promise<void> {
	const Key = `${SOURCE_SVGS_FOLDER}${id}.svg`

	try {
		await extendedGlobal.s3.deleteObject({ Key }).promise()
	} catch(e) {
		throw new Error(e)
	}
}