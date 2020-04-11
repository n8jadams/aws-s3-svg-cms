import fetch from 'isomorphic-unfetch'

export async function save(payload: SavingPayload): Promise<Response> {
	return await fetch('/api/save', {
		method: 'POST',
		mode: 'cors', // no-cors, *cors, same-origin
		headers: {
			'Content-Type': 'application/json'
		},
		referrerPolicy: 'no-referrer', // no-referrer, *client
		body: JSON.stringify(payload)
	})
}