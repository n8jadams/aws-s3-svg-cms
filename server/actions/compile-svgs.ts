import SVGSpriter from 'svg-sprite'
import S3 from 'aws-sdk/clients/s3'
import fetch from 'node-fetch'

import { extendedGlobal } from '../extended-global'
import { fetchSourceSvgs } from './fetch-source-svgs'
import { COMPILED_SVG_FILENAME } from '../consts/compiled-svg-filename'
import { S3_BUCKET_NAME, SPRITE_SHEET_FILENAME_WITHOUT_EXT } from '../consts/env'

const config = {
  log: null,
  shape: {
    id: {
      separator: '--',
      pseudo: '~'
    },
    dimension: {
      maxWidth: 2000,
      maxHeight: 2000,
      precision: 2,
      attributes: true
    },
    spacing: {
      padding: 0,
      box: 'content'
    },
    transform: ['svgo'],
    meta: null,
    align: null,
    dest: null
  },
  svg: {
    xmlDeclaration: false,
    doctypeDeclaration: false,
    namespaceIDs: true,
    namespaceIDPrefix: '',
    namespaceClassnames: true,
    dimensionAttributes: false
  },
  variables: {},
  mode: {
    inline: true,
    symbol: {
      dest: 'combined',
      sprite: `${SPRITE_SHEET_FILENAME_WITHOUT_EXT}.svg`
    }
  }
}

export async function compileSvgs(): Promise<void> {
  try {
    const { s3 } = extendedGlobal
    const spriter = new SVGSpriter(config)
    const sourceSvgs = await fetchSourceSvgs(true)

    sourceSvgs.forEach(svg => {
      spriter.add(`/null/${svg.id}.svg`, null, svg.body, {
        encoding: 'utf-8'
      })
    })

    // Compile the sprite
    spriter.compile(async (err, result) => {
      try {
        if (!!err) {
          throw new Error(err)
        }

        // This is a buffer with what we want to save in S3
        const Body: Buffer = result.symbol.sprite.contents

        // Delete the original
        let svgAlreadyInS3 = true
        try {
          await fetch(
            `https://svg-cms.s3-us-west-2.amazonaws.com/${COMPILED_SVG_FILENAME}`
          )
        } catch (_) {
          svgAlreadyInS3 = false
        }

        if (svgAlreadyInS3) {
          await s3
            .deleteObject({
              Bucket: S3_BUCKET_NAME,
              Key: COMPILED_SVG_FILENAME
            })
            .promise()
        }

        // Upload the new one
        await new S3.ManagedUpload({
          params: {
            Bucket: S3_BUCKET_NAME,
            Key: COMPILED_SVG_FILENAME,
            Body,
            ContentType: 'image/svg+xml',
            ACL: 'public-read'
          }
        }).promise()
      } catch (e) {
        throw new Error(e)
      }
    })
  } catch (e) {
    throw new Error(e)
  }
}
