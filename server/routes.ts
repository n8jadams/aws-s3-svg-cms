import * as fastify from 'fastify'
import { FastifyReply } from 'fastify'
import { ServerResponse } from 'http'

import { fetchSourceSvgs } from './actions/fetch-source-svgs'
import { idRenameSvg } from './actions/id-rename-svg'
import { addSvg } from './actions/add-svg'
import { deleteSvg } from './actions/delete-svg'
import { compileSvgs } from './actions/compile-svgs'

import { validateId } from './utils/validate-id'
import { validateSvg } from './utils/validate-svg'

export async function routes(
  fastifyInstance: fastify.FastifyInstance
): Promise<void> {
  fastifyInstance.route({
    method: 'GET',
    url: '/',
    handler: async (_, reply: FastifyReply<ServerResponse>) => {
      reply.view('index.html')
      return reply
    }
  })

  fastifyInstance.route({
    method: 'GET',
    url: '/api/fetch-source-svgs',
    handler: async (): Promise<Svg[]> => {
      return await fetchSourceSvgs()
    }
  })

  fastifyInstance.route({
    method: 'POST',
    url: '/api/save',
    handler: async (
      request: { body: SavingPayload },
      reply: FastifyReply<ServerResponse>
    ): Promise<void> => {
      const payload = request.body

      // Validate the given ids
      if (!payload.every(o => validateId(o.id))) {
        throw new Error('Invalid id passed')
      }

      // Validate the SVGs of any adds
      if (
        !payload
          .filter(o => o.name === 'add')
          .every((o: AddSvgPayload) => validateSvg(o.body))
      ) {
        throw new Error('Invalid SVG uploaded')
      }

      await Promise.all(
        payload.map(
          async (change): Promise<void> => {
            switch (change.name) {
              case 'idRename':
                await idRenameSvg(change)
                return
              case 'add':
                await addSvg(change)
                return
              case 'delete':
                await deleteSvg(change)
                return
            }
          }
        )
      ).catch(e => {
        throw new Error(e)
      })

      try {
        await compileSvgs()
        reply.code(200).send()
      } catch (error) {
        reply.code(500).send({ status: false, message: 'Unable to compile svg.' })
      }
    }
  })
}
