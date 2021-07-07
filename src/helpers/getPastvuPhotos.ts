import fetch from 'node-fetch'

export type PastvuItem = {
	ccount: number
	cid: number
	dir: string
	file: string
	geo: [number, number]
	title: string
	year: number
	s: number
}

export type PastvuPhotos = {
	result: { photos: PastvuItem[] }
}
export const getPastvuPhotos = async (
	latitude: number,
	longitude: number,
): Promise<PastvuPhotos> => {
	const response = await fetch(
		`https://pastvu.com/api2?method=photo.giveNearestPhotos&params={"geo":[${latitude}, ${longitude}]}`,
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
