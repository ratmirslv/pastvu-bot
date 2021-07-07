import chunk from 'lodash/chunk'
import isEmpty from 'lodash/isEmpty'
import { Scenes } from 'telegraf'

import { getPastvuPhotos } from '../helpers/getPastvuPhotos'
import { sendPhotos } from '../helpers/sendPhotos'
import { ContextBot } from '../index'

export const pastvu = new Scenes.BaseScene<ContextBot>('pastvu')

pastvu.enter(async (ctx) => {
	if (ctx?.message && 'location' in ctx.message) {
		const { latitude, longitude } = ctx.message.location
		ctx.scene.session.pastvuData = undefined

		try {
			const { result } = await getPastvuPhotos(latitude, longitude)

			if (result.photos.length === 0) {
				await ctx.scene.leave()
				return await ctx.reply('Фотографии в данной локации не найдены.')
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
				return await ctx.reply(`Ошибка. ${err.message}`)
			}
			await ctx.reply(`Ошибка, попробуйте еще раз.`)
		}
	}
})

pastvu.hears('🔍 Еще фотографий', async (ctx) => {
	try {
		if (
			ctx.scene.session.pastvuData &&
			ctx.scene.session.counterData < ctx.scene.session.pastvuData.length
		) {
			await sendPhotos(ctx, ctx.scene.session.pastvuData[ctx.scene.session.counterData])
			ctx.scene.session.counterData += 1
		} else {
			await ctx.reply(`Больше фотографий в данной локации нет`)
			await ctx.scene.leave()
		}
	} catch (err) {
		if (err instanceof Error) {
			return await ctx.reply(`Ошибка. ${err.message}`)
		}
		await ctx.reply(`Ошибка, попробуйте еще раз.`)
	}
})
