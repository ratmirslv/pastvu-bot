import isEqual from 'lodash/isEqual'
import uniqWith from 'lodash/uniqWith'
import { Scenes, Markup } from 'telegraf'

import { ContextBot } from '../index'

export const settings = new Scenes.BaseScene<ContextBot>('settings')
//период с 1839 по 2000 год
const REGEX_YEARS = /^(18[3-9][0-9]|19\d{2}|2000)-(18[3-9][0-9]|19\d{2}|2000)$/g

settings.enter(async (ctx) => {
	try {
		ctx.data.startYear = ctx.data.startYear || 1839
		ctx.data.endYear = ctx.data.endYear || 2000
		ctx.data.history = ctx.data.history || []

		await ctx.reply(
			`Добро пожаловать в настройки. Текущий период:${ctx.data.startYear}-${ctx.data.endYear}\nВыберите даты из истории, или введите период в формате: 1941-1945\nP.S. Нижняя  и верхняя граница - 1839 и 2000`,
			Markup.inlineKeyboard(
				ctx.data.history.map(
					(range) =>
						Markup.button.callback(
							`${range.startYear}-${range.endYear}`,
							`${range.startYear}-${range.endYear}`,
						),
					{ columns: 1 },
				),
			),
		)
	} catch (err) {
		if (err instanceof Error) {
			return await ctx.reply(`Ошибка сохранения настроек. ${err.message}`)
		}
	}
})
async function handlerYearsAction(
	parseStartYear: number,
	parseEndYear: number,
	ctx: ContextBot,
) {
	try {
		if (parseStartYear > parseEndYear) {
			return await ctx.reply(
				`Ошибка, дата окончания должна быть больше или равна даты начала`,
			)
		}
		ctx.data.history = uniqWith(
			[...ctx.data.history, { startYear: ctx.data.startYear, endYear: ctx.data.endYear }],
			isEqual,
		)
			.reverse()
			.slice(0, 3)
		ctx.data.startYear = parseStartYear
		ctx.data.endYear = parseEndYear

		return await ctx.reply('Все отлично. Новый период назначен.')
	} catch (err) {
		if (err instanceof Error) {
			return await ctx.reply(`Ошибка сохранения настроек. ${err.message}`)
		}
	}
}
settings.hears(REGEX_YEARS, async (ctx) => {
	const [, parseStartYear, parseEndYear] = ctx.match

	await handlerYearsAction(Number(parseStartYear), Number(parseEndYear), ctx)

	settings.leave()
})
settings.action(REGEX_YEARS, async (ctx) => {
	const [, parseStartYear, parseEndYear] = ctx.match

	await handlerYearsAction(Number(parseStartYear), Number(parseEndYear), ctx)

	settings.leave()
})
