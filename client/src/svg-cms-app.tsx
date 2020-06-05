import React, { useEffect, useReducer, useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useDropzone } from 'react-dropzone'
import cx from 'classnames'

import { deriveFileExtension } from './utils/derive-file-extension'
import { validateXML } from './utils/validate-xml'
import { copyToClipboard } from './utils/copy-to-clipboard'
import { COMPILED_SPRITE_SHEET_URL } from './consts/env'

import { fetchSourceSvgs, save } from './requests'

import { TopLoader } from './top-loader'

import './svg-cms-app.css'

enum ACTIONS {
	LOAD_SOURCE_SVGS,
	START_UPDATING_ID,
	UPDATE_ID,
	ADD,
	DELETE,
	SAVE
}

type ReducerPayload =
	| {
		type: ACTIONS.LOAD_SOURCE_SVGS
		data: { sourceSvgs: Svg[] }
	}
	| {
		type: ACTIONS.START_UPDATING_ID
		data: { uuid: string }
	}
	| {
		type: ACTIONS.UPDATE_ID
		data: { uuid: string, newId: string }
	}
	| {
		type: ACTIONS.ADD
		data: { newSvg: SvgState }
	}
	| {
		type: ACTIONS.DELETE
		data: { uuid: string }
	}
	| {
		type: ACTIONS.SAVE
	}

function SvgCmsAppReducer(prevState: SvgListState, payload: ReducerPayload) {
	switch (payload.type) {
		case ACTIONS.LOAD_SOURCE_SVGS:
			const returnValue = payload.data.sourceSvgs.reduce((acc: SvgListState, svg: Svg) => {
				const svgState: SvgState = { ...svg, editingId: false, idFromS3: svg.id }
				acc[uuidv4()] = svgState
				return acc
			}, {})
			return returnValue
		case ACTIONS.ADD:
			// Ensure the id doesn't collide with one already on the page
			while(Object.keys(prevState).some(key => payload.data.newSvg.id === prevState[key].id)) {
				payload.data.newSvg.id += '-copy'
			}
			return { ...prevState, [uuidv4()]: payload.data.newSvg }
		case ACTIONS.DELETE:
			const deletedSvg = prevState[payload.data.uuid]
			if (!!deletedSvg.body) {
				delete prevState[payload.data.uuid]
				return { ...prevState }
			}
			return { ...prevState, [payload.data.uuid]: { ...deletedSvg, toBeDeleted: true } }
		case ACTIONS.START_UPDATING_ID: {
			const svg = prevState[payload.data.uuid]
			return { ...prevState, [payload.data.uuid]: { ...svg, editingId: true } }
		}
		case ACTIONS.UPDATE_ID:
			const updatedSvg = prevState[payload.data.uuid]
			return { ...prevState, [payload.data.uuid]: { ...updatedSvg, editingId: false, id: payload.data.newId } }
		case ACTIONS.SAVE:
			let newState = {}
			Object.keys(prevState).forEach(key => {
				const modifiedSvg = prevState[key]
				if (!modifiedSvg.toBeDeleted) {
					const resetSvgState: SvgState = { id: modifiedSvg.id, url: modifiedSvg.url, idFromS3: modifiedSvg.id, editingId: false }
					newState[key] = resetSvgState
				}
			})
			return newState
		default:
			throw new Error('This should never happen')
	}
}

export function SvgCmsApp(): React.ReactElement {
	const [loading, setLoading] = useState(false)
	const [initialLoading, setInitialLoading] = useState(true)
	const [svgs, dispatch] = useReducer(SvgCmsAppReducer, {})

	useEffect(() => {
		// Load the separate svgs from S3
		void (async () => {
			const sourceSvgs = await fetchSourceSvgs()
			dispatch({ type: ACTIONS.LOAD_SOURCE_SVGS, data: { sourceSvgs } })
			setInitialLoading(false)
		})()
	}, [])

	// Convert to a nice array of states for rendering
	let unsavedChanges = false
	const svgList: SvgState[] = Object.keys(svgs).map(uuid => {
		const svg: SvgState = svgs[uuid]
		if (!!svg.body || !!svg.toBeDeleted || (!!svg.idFromS3 && svg.id !== svg.idFromS3)) {
			unsavedChanges = true
		}
		return { ...svg, uuid }
	}).sort((a: SvgState, b: SvgState) => a.id < b.id ? -1 : 1)

	// Prompt the user to save before quitting
	useEffect((): () => void => {
		function handleBeforeUnload(e) {
			e.preventDefault()
			// Chrome requires returnValue to be set
			e.returnValue = ''
		}

		if (unsavedChanges) {
			window.addEventListener('beforeunload', handleBeforeUnload)
		}

		return (): void => {
			if (unsavedChanges) {
				window.removeEventListener('beforeunload', handleBeforeUnload)
			}
		}
	}, [unsavedChanges])

	const onDrop = useCallback((acceptedFiles) => {
		acceptedFiles.forEach((file) => {
			const extension = deriveFileExtension(file.name)
			if (extension !== 'svg') {
				const errorMessage = `${file.name} is not an SVG`
				alert(errorMessage)
				throw new Error(errorMessage)
			}
			const reader = new FileReader()

			reader.onabort = () => alert('file reading was aborted')
			reader.onerror = () => alert('file reading has failed')
			reader.onload = () => {
				const svgAsString = String(reader.result)
				validateXML(svgAsString)
				const id = file.name.replace(`.${extension}`, '')
				const newSvg: SvgState = {
					url: `data:image/svg+xml;base64,${window.btoa(svgAsString)}`,
					id,
					editingId: false,
					body: svgAsString
				}
				dispatch({ type: ACTIONS.ADD, data: { newSvg } })
			}
			reader.readAsText(file)
		})

	}, [])
	const { getRootProps, getInputProps } = useDropzone({ onDrop })

	async function saveChanges() {
		// Gather up the actual changes
		let compilingPayload = []
		const changes: SavingPayload = Object.keys(svgs).reduce((acc: SavingPayload, uuid: string) => {
			const svg: SvgState = svgs[uuid]
			switch (true) {
				case !!svg.body:
					acc.push({ name: 'add', id: svg.id, body: svg.body })
					break
				case !!svg.idFromS3 && svg.idFromS3 !== svg.id:
					acc.push({ name: 'idRename', id: svg.id, idFromS3: svg.idFromS3 })
					break
				case !!svg.toBeDeleted:
					acc.push({ name: 'delete', id: svg.id })
					break
			}

			// Add to compiling payload
			if (!!svg.body) {
				compilingPayload.push({ id: svg.id, body: svg.body })
			}
			return acc
		}, [])

		try {
			setLoading(true)
			await save(changes)
			dispatch({ type: ACTIONS.SAVE })
			setLoading(false)
		} catch (e) {
			alert(`ERROR: ${e}.\nTry refreshing the page...`)
		}
		setLoading(false)
	}

	return (
		<>
			<div className="loader-container">
				<TopLoader loading={initialLoading || loading} />
			</div>
			<header>
				<h1>SVG CMS</h1>
				<button
					className={cx({
						'save-button': true,
						'no-unsaved-changes': !unsavedChanges
					})}
					disabled={initialLoading || loading || !unsavedChanges}
					onClick={saveChanges}
				>Save</button>
			</header>
			<main>
				{initialLoading ? (
					<div>Loading...</div>
				) : (
						<ul>
							{!!svgList.length && svgList.filter(svg => !svg.toBeDeleted).map((svg: SvgState) => (
								<li key={svg.uuid}>
									<button
										className="delete-button"
										onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
											const promptForDeletion = !!svg.idFromS3
											if (promptForDeletion && confirm("Are you sure you want to delete this svg? It may be in use on the site.")) {
												dispatch({ type: ACTIONS.DELETE, data: { uuid: svg.uuid } })
											} else if (promptForDeletion) {
												e.preventDefault()
											} else {
												dispatch({ type: ACTIONS.DELETE, data: { uuid: svg.uuid } })
											}
										}}
									>
										<div className="delete-button-inner" />
									</button>
									<div className="icon-box">
										<img src={svg.url} />
									</div>
									<div className="display-flex">
										{svg.editingId ? (
											<input
												type="text"
												className="update-id-input"
												defaultValue={svg.id}
												autoFocus
												onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
													e.target.select()
												}}
												onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
													// Prevent unallowed keys.
													const forbiddenKeys = [
														' ', '~', '!', '@', '#',
														'$', '%', '^', '&', '*',
														'(', ')', '_', '+', '=',
														'[', ']', '{', '}', '\\',
														'|', ':', '"', "'", '<',
														'>', '.', '/', '?'
													]
													if (forbiddenKeys.indexOf(e.key) !== -1) {
														e.preventDefault()
													}
													// Blur if the user hits enter
													if (e.key === 'Enter') {
														e.target.blur()
													}
												}}
												onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
													const newId = e.target.value.toLowerCase().replace(/[^a-zA-Z\d\s\-:]/g, '').replace(/\s/g, '-')
													if (newId !== svg.id && svgList.some(s => s.id === newId)) {
														alert(`An svg with the id of "${newId}" already exists! Try a different id.`)
													} else if (!newId) {
														alert('Svg id cannot be empty.')
													} else {
														dispatch({ type: ACTIONS.UPDATE_ID, data: { uuid: svg.uuid, newId } })
													}
												}}
											/>
										) : (
												<>
													<button
														className="update-id-button"
														onClick={() => {
															dispatch({ type: ACTIONS.START_UPDATING_ID, data: { uuid: svg.uuid } })
														}}
													>{svg.id}</button>
													<button
														className="copy-to-clipboard-button"
														onClick={() => {
															copyToClipboard(svg.id)
															alert(`Copied svg id "${svg.id}" to clipboard!`)
														}}
													>📋</button>
												</>
											)}
									</div>
								</li>
							))}

							<li {...getRootProps()} className="cursor-pointer">
								<div className="icon-box-new" />
								<label className="add-svg-text">Add New SVG(s)</label>
							</li>
						</ul>
					)}
			</main>
			<input {...getInputProps()} />
			<footer>
				<label htmlFor="compiled-sprite-sheet-url">Sprite Sheet Url:</label>
				<input
					type="text"
					id="compiled-sprite-sheet-url"
					className="preview-input"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => { e.preventDefault() }}
					value={COMPILED_SPRITE_SHEET_URL}
					onClick={(e: React.MouseEvent<HTMLInputElement>) => {
						e.target.select()
					}}
				/>
			</footer>
		</>
	)
}