/* eslint-disable @typescript-eslint/no-explicit-any */
import S3 from 'aws-sdk/clients/s3'

interface ExtendedGlobal extends NodeJS.Global {
	s3: any
}
export const extendedGlobal: ExtendedGlobal = global as any