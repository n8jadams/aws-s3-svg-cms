# AWS S3 SVG CMS
A frontend for managing an SVG spritesheet, using an AWS S3 bucket.

(NEW: Comes with a development experience that mocks the S3 API locally)

![AWS S3 SVG CMS Screenshot](screenshot.jpg)

## Prerequisites
[A modern version of Node](https://nodejs.org/en/download/)


## Setup
### Development - Using localhost and the filesystem
1. Clone this repo
2. Duplicate the `.env.example` and rename it `.env`
```bash
$ cp .env.example .env
```
3. Fill out the all of the `.env` variables. It doesn't matter what they are, except `SPRITE_SHEET_FILENAME_WITHOUT_EXT`, this will be the name of the compiled sprite sheet. (Exclude `.svg`.)
4. Install, run the dev script
```bash
$ npm install
$ npm run dev
```
5. Open up http://localhost:4000 and verify changes and compiled sprite sheet in the `.dev` directory!

### Production - Using an AWS S3 bucket

1. Clone this repo
2. Duplicate the `.env.example` and rename it `.env`.
```bash
$ cp .env.example .env
```
3. Fill out the `.env` variable for `SPRITE_SHEET_FILENAME_WITHOUT_EXT`. (As indicated, don't include `.svg` or any extension.)
4. [In the AWS S3 console](https://s3.console.aws.amazon.com/s3/), create a bucket. Add the name of the bucket to the `S3_BUCKET_NAME` variable in your `.env` as well as the `AWS_DEFAULT_REGION`. You probably want to this bucket to have public read access.
5. In your S3 bucket, create folders named `compiled-svg-sheet` and `source-svgs`
6. (Optional, if you haven't set your `~/.aws/config` or if your default isn't the user you want), [In the AWS IAM console](https://console.aws.amazon.com/iam/home#/security_credentials), grab your credentials and set the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in your `.env`. Any user that has read/write permissions on the S3 bucket will do.
7. Install, build, and start the app.
```bash
$ npm install
$ npm run build
$ npm start
```
8. Open up http://localhost:4000
9. After making changes, the compiled sprite sheet will be accessible at the following url:
```
https://{S3_BUCKET_NAME}.s3-{AWS_DEFAULT_REGION}.amazonaws.com/compiled-svg-sheet/{SPRITE_SHEET_FILENAME_WITHOUT_EXT}.svg
```

## Using the SVG Sprite Sheet
Inject it into your page with javascript like so:

```javascript
window.addEventListener('load', () => {
	const svgUrl = `https://${S3_BUCKET_NAME}.s3-${AWS_DEFAULT_REGION}.amazonaws.com/compiled-svg-sheet/${SPRITE_SHEET_FILENAME_WITHOUT_EXT}.svg`

	fetch(svgUrl)
		.then((res) => {
			if (!res.ok) {
				throw new Error(res.statusText)
			}
			return res.text()
		})
		.then((svg) => {
			const div = document.createElement('div')
			div.innerHTML = svg
			document.body.insertBefore(div, document.body.childNodes[0])
		})
		.catch((e) => {
			throw new Error(e)
		})
})
```

And then add individual svgs in your html!

```html
<div class="some-container-class">
	<svg>
		<use xlink:href="#some-svg-id"></use>
	</svg>
</div>
```
