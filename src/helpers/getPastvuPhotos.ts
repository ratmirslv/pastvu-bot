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

type PropsGetPastvuPhotos = {
	latitude: number
	longitude: number
	startYear: number
	endYear: number
}

export type PastvuPhotos = {
	result: { photos: PastvuItem[] }
}
export const getPastvuPhotos = async (
	props: PropsGetPastvuPhotos,
): Promise<PastvuPhotos> => {
	const { latitude, longitude, startYear, endYear } = props
	const response = await fetch(
		`https://pastvu.com/api2?method=photo.giveNearestPhotos&params={"geo":[${latitude}, ${longitude}],"year":${startYear},"year2":${endYear}}`,
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
