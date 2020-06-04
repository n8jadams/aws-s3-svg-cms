// Reverse engineered S3 functions for dev enviornment

module.exports = class S3Mock {
	constructor({
		apiVersion,
		params: { Bucket }
	}) {}

	listObjectsV2({ Delimiter, Prefix }) {

	}
	
	ManagedUpload({
		params: {
			Bucket,
			Key,
			Body,
			ContentType,
			ACL
		}
	}) {
		return { promise: () => Promise.resolve() }
	}

	copyObject({
		Bucket,
		CopySource,
		Key,
		ACL
	}) {
		return { promise: () => Promise.resolve() }
	}

	deleteObject({
		Bucket,
		Key
	}) {
		return { promise: () => Promise.resolve() }
	}
}