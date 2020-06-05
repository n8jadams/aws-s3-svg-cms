const path = require('path')
const fs = require('fs')

module.exports = async (s3SvgPath) => {
	const pathParts = s3SvgPath.split('/')
	const svgFilename = pathParts[pathParts.length - 1]
	const maybeCompiledFolder = pathParts[pathParts.length - 2]
	const fullSvgPath = `${path.resolve(__dirname, 'source-svgs', svgFilename)}`
	// Throw if it's asking for the the compiled file and it doesn't exist in the filesystem
	if(maybeCompiledFolder === 'compiled-svg-sheet' && !fs.existsSync(fullSvgPath)) {
		throw new Error()
	}
	const svgString = fs.readFileSync(fullSvgPath)
	return { text: async () => svgString }
}
