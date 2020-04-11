import * as fastify from 'fastify'
import { FastifyReply } from 'fastify'
import { ServerResponse } from 'http'
import { is } from 'typescript-is'

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

      // Validate payload format
      if(!is<SavingPayload>(payload)) {
        throw new Error('Invalid request body format')
      }

      // Validate id uniqueness
      let passedIds = []
      payload.forEach(change => {
        if(passedIds.indexOf(change.id) !== -1) {
          throw new Error('Ids must be unique')
        }
        passedIds.push(change.id)
      })

      // Validate the given ids
      if (!payload.every(change => validateId(change.id))) {
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
