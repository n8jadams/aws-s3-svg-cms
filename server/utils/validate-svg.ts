import { JSDOM } from 'jsdom'

export function validateSvg(svg: string): boolean {
	try {
		const { window } = new JSDOM(svg)
		const { DOMParser } = window
		const parser = new DOMParser()
		const doc = parser.parseFromString(svg, 'text/xml')
		const svgXML = doc.documentElement
		svgXML.outerHTML
		return true
	} catch (e) {
		return false
	}
}
