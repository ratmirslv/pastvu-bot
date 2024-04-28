import fetch from 'node-fetch'

import { PastvuItem } from './getPastvuPhotos'

export type PastvuPhotos = {
	result: { photos: PastvuItem[] }
}
export const getPastvuRandomPhotos = async (): Promise<PastvuPhotos> => {
	const response = await fetch(
		`https://pastvu.com/api2?method=photo.givePS&params={"cid":1,"random":true}`,
	)

	if (!response.ok) {
		throw new Error(`Request failed: ${response.url}: ${response.status}`)
	}

	const json = (await response.json()) as { error: { error_msg: string } } | PastvuPhotos

	if ('error' in json) {
		throw new Error(`Request failed: ${response.url}: ${json.error.error_msg}`)
	}

	return json
}
