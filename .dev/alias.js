// Apparently the Typescript team doesn't want you to be able to alias and override node module imports
// https://github.com/microsoft/TypeScript/issues/10866#issuecomment-246789510
// So I have to do this myself manually

const fs = require('fs').promises
const path = require('path')
const glob = require('glob')

const serverJsFiles = glob.sync(`${path.resolve(__dirname, '../dist/server')}/**/*.js`)

for(const file of serverJsFiles) {
	fs.readFile(file, 'utf-8')
		.then((fileString) => {
			let changed = false
			// Replace "aws-sdk/clients/s3"
			if(fileString.includes('require("aws-sdk/clients/s3")')) {
				fileString = fileString.replace(/require\(\"aws-sdk\/clients\/s3\"\)/g, `require("${path.resolve(__dirname, 'S3Mock')}")`)
				changed = true
			}
			// Replace "isomorphic-unfetch"
			if(fileString.includes('require("isomorphic-unfetch")')) {
				fileString = fileString.replace(/require\(\"isomorphic-unfetch\"\)/g, `require("${path.resolve(__dirname, 'fetchMock')}")`)
				changed = true
			}
			if(changed) {
				fs.writeFile(file, fileString, 'utf-8')
			}
		})
}