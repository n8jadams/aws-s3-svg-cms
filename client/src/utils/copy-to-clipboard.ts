export function copyToClipboard(someString: string) {
	const tmpInput = document.createElement('input')
	tmpInput.value = someString
	tmpInput.type = 'text'
	tmpInput.style.position = 'absolute'
	tmpInput.style.left = '9000vw'
	document.body.appendChild(tmpInput)
	tmpInput.select()
	document.execCommand('copy')
	document.body.removeChild(tmpInput)
}