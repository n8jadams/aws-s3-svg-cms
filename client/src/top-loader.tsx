import React, { useEffect, useState } from 'react'
import LoadingBar from 'react-top-loading-bar'

interface TopLoaderProps {
	loading: boolean
}

const LOADING_MAX = 90

export function TopLoader({ loading }: TopLoaderProps): React.ReactElement<TopLoaderProps> {
	const [internalLoading, setInternalLoading] = useState(loading)
	const [progress, setProgress] = useState(1)

	useEffect(() => {
		if(loading) {
			// Kick off the counter!
			setProgress(0)
			setInternalLoading(true)
			const interval = setInterval(() => {
				setProgress(currentProgress => {
					if(currentProgress < LOADING_MAX) {
						return currentProgress + 10
					}
					clearTimeout(interval)
					return currentProgress
				})
			}, 500)
		} else {
			setProgress(100)
			const to = setTimeout(() => {
				setInternalLoading(false)
				clearTimeout(to)
			}, 1000)
		}
	}, [loading])

	return internalLoading ? (
		<LoadingBar
			progress={progress}
			height={3}
			color='red'
		/>
	) : null
}
