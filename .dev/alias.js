// Apparently the Typescript team doesn't want you to be able to alias and override node module imports
// https://github.com/microsoft/TypeScript/issues/10866#issuecomment-246789510
// So I have to do this myself manually

const path = require('path')
const replace = require('replace-in-file')

const SERVER_JS_FILES_GLOB = `${path.resolve(__dirname, '../dist/server')}/**/*.js`

Promise.all([
	// Replace "aws-sdk/clients/s3"
	replace({
		files: SERVER_JS_FILES_GLOB,
		from: /require\(\"aws-sdk\/clients\/s3\"\)/g,
		to: `require("${path.resolve(__dirname, 'S3Mock')}")`,
	}),
	// Replace isomorphic-unfetch.
	replace({
		files: SERVER_JS_FILES_GLOB,
		from: /require\(\"isomorphic-unfetch\"\)/g,
		to: `require("${path.resolve(__dirname, 'fetchMock')}")`,
	})
])