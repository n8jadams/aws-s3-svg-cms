import { REQUIRED_ENV_VARS } from '../consts/env'

export function validateEnv(): void {
	let missingRequiredEnvVars = REQUIRED_ENV_VARS.filter(k => !process.env[k])
	if(missingRequiredEnvVars.length > 0) {
		throw new Error(`Missing the following variables in your .env : ${missingRequiredEnvVars.join(', ')}`)
	}
}