import { Scenes } from 'telegraf'

import { getPastvuPhotos } from '../helpers/getPastvuPhotos'
import { BotContext } from '../index'

export const pastvu = new Scenes.BaseScene<BotContext>('pastvu')

pastvu.enter(async (ctx) => {
	if (ctx?.message && 'location' in ctx.message) {
		const { latitude, longitude } = ctx.message.location
		try {
			const res = await getPastvuPhotos(latitude, longitude)

			for (const photo of res.result.photos) {
				await ctx.replyWithPhoto(
					{ url: `https://pastvu.com/_p/d/${photo.file}` },
					{
						caption: `Год ${photo.year} ${photo.title}`,
					},
				)
			}
		} catch (err) {
			if (err instanceof Error) {
				return await ctx.reply(`Ошибка. ${err.message}`)
			}
			await ctx.reply(`Ошибка загрузки, попробуйте еще раз.`)
		}
	}
})
