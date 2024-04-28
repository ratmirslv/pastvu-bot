import fetch from 'node-fetch'

import { ContextBot } from '../index'

const PARSE_COORDINATES_REGEX = /[@/](-?\d+\.\d+),(-?\d+\.\d+)/

export async function setGeoData(message: string, ctx: ContextBot): Promise<void> {
	try {
		const res = await fetch(message, {
			redirect: 'manual',
		})

		if (res.status >= 200 && res.status < 400) {
			const fullUrl = res.headers.get('location') ?? res.url

			const match = RegExp(PARSE_COORDINATES_REGEX).exec(fullUrl)

			if (match) {
				const latitude = match[1]
				const longitude = match[2]
				ctx.geo = {
					latitude: Number(latitude),
					longitude: Number(longitude),
				}
			} else {
				throw new Error(ctx.i18n.t('errors.errorParseURL'))
			}
		}
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message)
		} else {
			throw new Error(ctx.i18n.t('errors.errorLetsTry'))
		}
	}
}
