/* eslint-disable @typescript-eslint/no-explicit-any */
interface ExtendedGlobal extends NodeJS.Global {
	s3: any
}
export const extendedGlobal: ExtendedGlobal = global as any