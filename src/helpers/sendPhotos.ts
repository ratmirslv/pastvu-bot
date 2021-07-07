import { PastvuItem } from '../helpers/getPastvuPhotos'
import { ContextBot } from '../index'

export const sendPhotos = async (
	ctx: ContextBot,
	pastvuData: PastvuItem[],
): Promise<void> => {
	try {
		await ctx.replyWithMediaGroup(
			pastvuData.map((item) => ({
				media: { url: `https://pastvu.com/_p/d/${item.file}` },
				caption: `Год ${item.year} ${item.title}`,
				parse_mode: 'HTML',
				type: 'photo',
			})),
		)
	} catch (error) {
		throw new Error('Ошибка отправки фотографий')
	}
}
