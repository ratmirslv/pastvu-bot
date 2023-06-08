import isEqual from 'lodash/isEqual'
import uniqWith from 'lodash/uniqWith'
import { Scenes, Markup } from 'telegraf'

import { ContextBot } from '../index'

export const settings = new Scenes.BaseScene<ContextBot>('settings')
//photography period from 1839 to 2000
const REGEX_YEARS = /^(18[3-9][0-9]|19\d{2}|2000)-(18[3-9][0-9]|19\d{2}|2000)$/g

settings.enter(async (ctx) => {
	try {
		ctx.data.startYear = ctx.data.startYear || 1839
		ctx.data.endYear = ctx.data.endYear || 2000
		ctx.data.history = ctx.data.history || []

		await ctx.reply(
			ctx.i18n.t('settingsInfo', {
				startYear: ctx.data.startYear,
				endYear: ctx.data.endYear,
			}),
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
			return await ctx.reply(`${ctx.i18n.t('errors.errorSave')} ${err.message}`)
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
			return await ctx.reply(ctx.i18n.t('errors.errorSetPeriod'))
		}
		ctx.data.history = uniqWith(
			[...ctx.data.history, { startYear: ctx.data.startYear, endYear: ctx.data.endYear }],
			isEqual,
		)
			.reverse()
			.slice(0, 3)
		ctx.data.startYear = parseStartYear
		ctx.data.endYear = parseEndYear

		return await ctx.reply(ctx.i18n.t('successSetPeriod'))
	} catch (err) {
		if (err instanceof Error) {
			return await ctx.reply(`${ctx.i18n.t('errors.errorSave')} ${err.message}`)
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
