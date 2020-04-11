/// <reference path="../types/types.d.ts" />

import 'dotenv/config'
import fastify from 'fastify'
import { v4 as uuidv4 } from 'uuid'
import { IncomingMessage, Server, ServerResponse } from 'http'
import path from 'path'
import pointOfView from 'point-of-view'
import hbs from 'handlebars'
import fastifyStatic from 'fastify-static'

import { validateEnv } from './utils/validate-env'
import { routes } from './routes'

// Set extendedGlobal.s3
import './aws-service'

validateEnv()

const server: fastify.FastifyInstance<
	Server,
	IncomingMessage,
	ServerResponse
> = fastify({
	https: null,
	genReqId: (): string => uuidv4.toString(),
	logger: false,
	ignoreTrailingSlash: true,
	disableRequestLogging: true
})

async function bootstrap(): Promise<void> {
	try {
		const viewDir = path.resolve('dist/client')
		server.register(pointOfView, {
			engine: {
				handlebars: hbs
			},
			includeViewExtension: false,
			templates: viewDir
		})

		// #TODO: tech debt to add cdn for prod and then only register this if not production
		server.register(fastifyStatic, {
			root: viewDir,
			prefix: '/'
		})

		server.register(routes)

		await server.listen(
			{ port: Number(process.env.LOCALHOST_PORT), },
			(err: Error) => {
				if (err) {
					console.error({ msg: 'error starting server', err })
				} else {
					console.log(`Server listening at http://localhost:${process.env.LOCALHOST_PORT}`)
				}
			}
		)
	} catch (error) {
		// eslint-disable-next-line no-console
		console.log(error)
		process.exit(1)
	}
}

void bootstrap()
