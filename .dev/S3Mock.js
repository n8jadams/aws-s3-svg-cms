// Reverse engineered S3 functions for dev enviornment
const fs = require('fs')
const path = require('path')

const SOURCE_SVGS_PATH = path.resolve(__dirname, 'source-svgs')

module.exports = class S3Mock {
  listObjectsV2() {
    return {
      promise: () =>
        new Promise((resolve) => {
          const svgFilenames = fs
            .readdirSync(SOURCE_SVGS_PATH)
						.reduce((acc, filename) => {
							if(filename.split('.').pop().toLowerCase() !== 'svg') {
								return acc
							}
							acc.push({ Key: filename })
							return acc
						}, [])
					resolve({ Contents: svgFilenames })
        }),
    }
  }
  ManagedUpload({ params: { Bucket, Key, Body, ContentType, ACL } }) {
    return { promise: () => Promise.resolve() }
  }
  copyObject({ Bucket, CopySource, Key, ACL }) {
    return { promise: () => Promise.resolve() }
  }
  deleteObject({ Bucket, Key }) {
    return { promise: () => Promise.resolve() }
  }
}
