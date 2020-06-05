// Reverse engineered S3 functions for dev enviornment
const fs = require('fs')
const path = require('path')

class S3Mock {

  listObjectsV2() {
    return {
      promise: () =>
        new Promise((resolve) => {
          const svgFilenames = fs
            .readdirSync(path.resolve(__dirname, 'source-svgs'))
            .reduce((acc, filename) => {
              if (filename.split('.').pop().toLowerCase() !== 'svg') {
                return acc
              }
              acc.push({ Key: filename })
              return acc
            }, [])
          resolve({ Contents: svgFilenames })
        }),
    }
  }

  copyObject({ Bucket, CopySource, Key, ACL }) {
    return {
      promise: () => {
        return new Promise((resolve) => {
					const originalFilename = CopySource.split('/').filter((_, i) => i > 0).join('/')
					const originalPath = path.resolve(__dirname, originalFilename)
					const renamedPath = path.resolve(__dirname, Key)
					fs.copyFileSync(originalPath, renamedPath)
          resolve()
        })
			}
    }
  }

  deleteObject({ Key }) {
		return {
			promise: () => {
				return new Promise((resolve) => {
					const svgToDeletePath = path.resolve(__dirname, Key)
					fs.unlinkSync(svgToDeletePath)
					resolve()
				})
			}
		}
	}
	
}

S3Mock.ManagedUpload = function ({ params: { Key, Body } }) {
  return {
    promise: () =>
      new Promise((resolve) => {
        const bodyAsString = Buffer.from(Body).toString()
        const newSvgPath = path.resolve(__dirname, Key)
        fs.writeFileSync(newSvgPath, bodyAsString, 'utf-8')
        resolve()
      }),
  }
}

module.exports = S3Mock
