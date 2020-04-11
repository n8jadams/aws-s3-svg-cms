export function validateXML(svg: string): void {
	try {
		const parser = new DOMParser()
		const parsedXML = parser.parseFromString(svg, 'text/xml')
		parsedXML.querySelector('svg')
	} catch (e) {
		throw new Error('Invalid SVG')
	}
}
