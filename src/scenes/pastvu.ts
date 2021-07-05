import { Scenes } from 'telegraf'

import { getPastvuPhotos } from '../helpers/getPastvuPhotos'
import { BotContext } from '../index'

export const pastvu = new Scenes.BaseScene<BotContext>('pastvu')

pastvu.enter(async (ctx) => {
	if (ctx?.message && 'location' in ctx.message) {
		const { latitude, longitude } = ctx.message.location
		try {
			const { result } = await getPastvuPhotos(latitude, longitude)

			if (result.photos.length === 0) {
				return await ctx.reply('Фотографии в данной локации не найдены.')
			}

			if (result.photos.length === 1) {
				return await ctx.replyWithPhoto(
					{ url: `https://pastvu.com/_p/d/${result.photos[0].file}` },
					{ caption: `Год ${result.photos[0].year} ${result.photos[0].title}` },
				)
			}

			await ctx.replyWithMediaGroup(
				result.photos.map((item) => ({
					media: { url: `https://pastvu.com/_p/d/${item.file}` },
					caption: `Год ${item.year} ${item.title}`,
					type: 'photo',
				})),
			)
		} catch (err) {
			if (err instanceof Error) {
				return await ctx.reply(`Ошибка. ${err.message}`)
			}
			await ctx.reply(`Ошибка загрузки, попробуйте еще раз.`)
		}
	}
})
