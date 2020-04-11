interface Svg {
	id: string
	url: string
	body?: string
}

interface SvgState {
	id: string
	url: string
	editingId: boolean
	readonly idFromS3?: string
	readonly body?: string
	toBeDeleted?: boolean

	// Used in rendering
	readonly uuid?: string
}

type SvgListState = {
	[uuid: string]: SvgState
}

interface IDRenameSvgPayload {
	name: 'idRename'
	idFromS3: string
	id: string
}

interface AddSvgPayload {
	name: 'add'
	id: string
	body: string
}

interface DeleteSvgPayload {
	name: 'delete'
	id: string
}

type SavingPayload = (IDRenameSvgPayload | AddSvgPayload | DeleteSvgPayload)[]

interface CompilingPayload {
	id: string
	body: string
}