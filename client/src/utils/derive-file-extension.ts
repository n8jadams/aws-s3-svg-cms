export function deriveFileExtension(filename: string): string {
	return filename.split('.').pop().toLowerCase()
}