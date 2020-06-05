const path = require('path')
const fs = require('fs')

module.exports = async (s3SvgPath) => {
  return {
    text: async () => {
			const svgFilename = s3SvgPath.split('/').pop()
			const fullSvgPath = `${path.resolve(__dirname, 'source-svgs', svgFilename)}`
			const svgString = fs.readFileSync(fullSvgPath)
			return svgString
    }
  }
}
