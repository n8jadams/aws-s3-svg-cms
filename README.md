# AWS S3 SVG CMS
A frontend for managing an SVG spritesheet, using an AWS S3 bucket.

## Prerequisites
[A modern version of Node](https://nodejs.org/en/download/)

## Setup

1. Clone this repo
2. Duplicate the `.env.example` and rename it `.env`.
```
$ cp .env.example .env
```
3. Fill out the `.env` variable for `SPRITE_SHEET_FILENAME_WITHOUT_EXT`. (As indicated, don't include `.svg` or any extension.)
4. [In the AWS S3 console](https://s3.console.aws.amazon.com/s3/), create a bucket. Add the name of the bucket to the `S3_BUCKET_NAME` variable in your `.env` as well as the `AWS_DEFAULT_REGION`. You probably want to this bucket to have public read access.
5. In your S3 bucket, create folders named `compiled-svg-sheet` and `source-svgs`
6. (Optional, if you haven't set your `~/.aws/config` or if your default isn't the user you want), [In the AWS IAM console](https://console.aws.amazon.com/iam/home#/security_credentials), grab your credentials and set the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in your `.env`. Any user that has read/write permissions on the S3 bucket will do.
7. Install, build, and start the app.
```
$ npm install
$ npm run build
$ npm start
```
8. Open up http://localhost:4000

## SVG Sprite Sheet
After making changes, the sprite sheet will be accessible at the following url:
```
https://{S3_BUCKET_NAME}.s3-{AWS_DEFAULT_REGION}.amazonaws.com/compiled-svg-sheet/{SPRITE_SHEET_FILENAME_WITHOUT_EXT}.svg
```

### Known bug
Sometypes ttypescript won't run because of a permissions thing. To fix it, `cd` into the project folder and grant the following permissions in the project.
```
$ cd /path/to/aws-s3-svg-cms
$ chmod -R u+x ./node_modules
```