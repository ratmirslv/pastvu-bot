import chunk from 'lodash/chunk'
import isEmpty from 'lodash/isEmpty'
import { Scenes } from 'telegraf'

import { getPastvuPhotos } from '../helpers/getPastvuPhotos'
import { sendPhotos } from '../helpers/sendPhotos'
import { ContextBot } from '../index'

export const pastvu = new Scenes.BaseScene<ContextBot>('pastvu')

pastvu.enter(async (ctx: ContextBot) => {
	if (ctx.geo) {
		ctx.scene.session.pastvuData = undefined
		const startYear = ctx.data.startYear || 1839
		const endYear = ctx.data.endYear || 2000

		try {
			const { result } = await getPastvuPhotos({
				latitude: ctx.geo.latitude,
				longitude: ctx.geo.longitude,
				startYear,
				endYear,
			})

			if (result.photos.length === 0) {
				await ctx.scene.leave()
				return await ctx.reply(ctx.i18n.t('emptyPhotos'))
			}

			const [firstChunk, ...otherChunks] = chunk(result.photos, 5)

			await sendPhotos(ctx, firstChunk)

			if (isEmpty(otherChunks)) {
				await ctx.scene.leave()
			}
			ctx.scene.session.pastvuData = otherChunks
			ctx.scene.session.counterData = 0
		} catch (err) {
			if (err instanceof Error) {
				return await ctx.reply(`${ctx.i18n.t('errors.error')} ${err.message}`)
			}
			await ctx.reply(ctx.i18n.t('errors.errorLetsTry'))
		}
	}
})

pastvu.hears(new RegExp('🔍'), async (ctx) => {
	try {
		if (
			ctx.scene.session.pastvuData &&
			ctx.scene.session.counterData < ctx.scene.session.pastvuData.length
		) {
			await sendPhotos(ctx, ctx.scene.session.pastvuData[ctx.scene.session.counterData])
			ctx.scene.session.counterData += 1
		} else {
			await ctx.reply(ctx.i18n.t('emptyPhotos'))
		}
	} catch (err) {
		if (err instanceof Error) {
			return await ctx.reply(`${ctx.i18n.t('errors.error')} ${err.message}`)
		}
		await ctx.reply(ctx.i18n.t('errors.errorLetsTry'))
	}
})
