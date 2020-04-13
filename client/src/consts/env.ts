// @ts-ignore
const AWS_DEFAULT_REGION = __AWS_DEFAULT_REGION__
// @ts-ignore
const S3_BUCKET_NAME = __S3_BUCKET_NAME__
// @ts-ignore
const SPRITE_SHEET_FILENAME_WITHOUT_EXT = __SPRITE_SHEET_FILENAME_WITHOUT_EXT__

export const COMPILED_SPRITE_SHEET_URL = `https://${S3_BUCKET_NAME}.s3-${AWS_DEFAULT_REGION}.amazonaws.com/compiled-svg-sheet/${SPRITE_SHEET_FILENAME_WITHOUT_EXT}.svg`