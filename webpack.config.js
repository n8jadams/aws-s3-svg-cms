require('dotenv/config')
const webpack = require('webpack')
const path = require('path')
const PurgecssPlugin = require('purgecss-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const glob = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (_, argv) => {
	const isProd = !!argv.production

	const createConfig = (projectName) => {
		const config = {
			devtool: isProd ? false : 'source-map',
			mode: 'none',
			entry: {
				[projectName]: path.resolve(__dirname, 'client/src/index.tsx')
			},
			output: {
				path: path.resolve(__dirname, 'dist/client'),
				filename: '[name].js',
			},
			module: {
				rules: [
					{
						test: /\.css$/,
						use: [
							{
								loader: 'style-loader'
							},
							{ loader: 'css-loader' }
						]
					},
					{
						test: /\.ts$|tsx/,
						use: ['babel-loader'],
						exclude: [/node_modules/]
					}
				]
			},
			resolve: {
				extensions: ['.js', '.jsx', '.ts', '.tsx']
			},
			plugins: [
				new PurgecssPlugin({
					paths: glob.sync(`../dist/${projectName}/*`)
				}),
				new HtmlWebpackPlugin({
					filename: 'index.html',
					hash: true,
					template: path.resolve(__dirname, 'client/src/template.html'),
					minify: isProd
						? {
								collapseWhitespace: true,
								removeComments: true
							}
						: false
				}),
				// The presence of these env variables are checked at runtime when starting up the server
				new webpack.DefinePlugin({
					__AWS_DEFAULT_REGION__: JSON.stringify(process.env.AWS_DEFAULT_REGION),
					__S3_BUCKET_NAME__: JSON.stringify(process.env.S3_BUCKET_NAME),
					__SPRITE_SHEET_FILENAME_WITHOUT_EXT__: JSON.stringify(process.env.SPRITE_SHEET_FILENAME_WITHOUT_EXT)
				})
			],
			watch: !isProd
		}

		if (isProd) {
			config.mode = 'production'
			config.optimization = {
				minimizer: [new TerserPlugin()],
			}
		}

		return config
	}

	const outputConfigs = [
		createConfig('svg-cms')	
	]

	return outputConfigs
}
