import fetch from 'isomorphic-unfetch'

export const fetchSourceSvgs = async (): Promise<Svg[]> => await fetch('/api/fetch-source-svgs').then(r => r.json())