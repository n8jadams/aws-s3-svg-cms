export function validateId(id: string): boolean {
	return id === id.toLowerCase().replace(/[^a-zA-Z\d\s\-:]/g, '').replace(/\s/g, '-')
}