const path = require('path')
const fs = require('fs')

module.exports = (fullSvgPath) => {
  return Promise.resolve({
    text: new Promise((resolve) => {
      const svgFilename = fullSvgPath.split('/').pop()
      debugger
      // Promise.all(
      // 	svgFilenames.map((svgFilename) => {
      // 		return fs.promises.readFile(`${SOURCE_SVGS_PATH}/${svgFilename}`, 'utf-8')
      // 	})
      // ).then((arrayOfSvgStrings) => {
      // 	const response = {
      // 		Contents: arrayOfSvgStrings.map(svgStr => {
      // 			return { Key: }
      // 		})
      // 	}
      // 	resolve(response)
      // }).catch((e) => {
      // 	console.error(e)
      // 	process.exit(1)
      // })
      resolve('')
    }),
  })
}
