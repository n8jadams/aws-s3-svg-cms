import { JSDOM } from 'jsdom'

export function filterSvgTopLevelDimensions(svg: string): string {
	try {
		const { window } = new JSDOM(svg)
		const { DOMParser } = window
		const parser = new DOMParser()
		const doc = parser.parseFromString(svg, 'text/xml')
		const svgXML = doc.documentElement
		svgXML.removeAttribute('width')
		svgXML.removeAttribute('height')
		return svgXML.outerHTML
	} catch (e) {
		throw new Error('Invalid SVG')
	}
}
