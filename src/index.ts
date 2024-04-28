import 'dotenv-safe/config'
import { Telegraf, Scenes, session, Context } from 'telegraf'
import { message } from 'telegraf/filters'
import TelegrafI18n from 'telegraf-i18n'
import TelegrafSessionLocal from 'telegraf-session-local'

import * as commands from './commands'
import { createKeyboard } from './helpers/createKeyboard'
import { PastvuItem } from './helpers/getPastvuPhotos'
import { setGeoData } from './helpers/setGeoData'
import i18n from './i18n'
import { pastvu, settings } from './scenes'

if (process.env.BOT_TOKEN === undefined) {
	throw new TypeError('BOT_TOKEN must be provided!')
}
interface BotSceneSession extends Scenes.SceneSessionData {
	pastvuData: PastvuItem[][] | undefined
	counterData: number
}

interface YearsRange {
	startYear: number
	endYear: number
}

interface DatabaseData extends YearsRange {
	history: YearsRange[]
}

export interface ContextBot extends Context {
	scene: Scenes.SceneContextScene<ContextBot, BotSceneSession>
	data: DatabaseData
	i18n: TelegrafI18n
	geo: {
		latitude: number
		longitude: number
	}
	random: boolean
}

const bot = new Telegraf<ContextBot>(process.env.BOT_TOKEN)

const stage = new Scenes.Stage<ContextBot>([pastvu, settings])

const localSession = new TelegrafSessionLocal({
	database: 'db/settings.json',
})

bot.use(localSession.middleware('data'))
bot.use(session())
bot.use(i18n.middleware())
bot.use(stage.middleware())

async function main() {
	bot.start((ctx: ContextBot) => {
		return ctx.reply(ctx.i18n.t('start'), createKeyboard(ctx))
	})

	bot.help(commands.help)

	bot.on(message('location'), (ctx: ContextBot) =>
		ctx
			.reply(ctx.i18n.t('buttons.location'), createKeyboard(ctx))
			.then(() => {
				if (ctx?.message && 'location' in ctx.message) {
					ctx.geo = ctx.message.location
				}
			})
			.then(() => ctx.scene.enter('pastvu')),
	)
	//we can't use telegraf-i18n/match because handler reacts only with currently selected language
	//https://github.com/telegraf/telegraf-i18n/issues/21#issuecomment-522180837
	bot.hears(new RegExp('⚙️'), (ctx: ContextBot) => {
		return ctx
			.reply(ctx.i18n.t('buttons.settings'), createKeyboard(ctx))
			.then(() => ctx.scene.enter('settings'))
	})
	bot.hears(new RegExp('🔍'), (ctx: ContextBot) => {
		return ctx
			.reply(ctx.i18n.t('buttons.morePhotos'), createKeyboard(ctx))
			.then(() => {
				if (ctx?.message && 'location' in ctx.message) {
					ctx.geo = ctx.message.location
				}
			})
			.then(() => ctx.scene.enter('pastvu'))
	})

	bot.hears(new RegExp('🎲'), (ctx: ContextBot) => {
		return ctx
			.reply(ctx.i18n.t('buttons.randomPhotos'), createKeyboard(ctx))
			.then(() => (ctx.random = true))
			.then(() => ctx.scene.enter('pastvu'))
	})

	bot.hears(
		new RegExp('https://maps.app.goo.gl|https://www.google.com/maps/place'),
		(ctx) => {
			return ctx
				.reply(ctx.i18n.t('buttons.location'), createKeyboard(ctx))
				.then(() => setGeoData(ctx.message.text, ctx))
				.then(() => ctx.scene.enter('pastvu'))
				.catch((err) => {
					if (err instanceof Error) {
						return ctx.reply(`${ctx.i18n.t('errors.error')} ${err.message}`)
					}
					return ctx.reply(ctx.i18n.t('errors.errorLetsTry'))
				})
		},
	)

	await bot.launch({
		webhook: process.env.WEBHOOK_URL
			? {
					port: process.env.PORT ? Number(process.env.PORT) : 8080,
					domain: process.env.WEBHOOK_URL,
			  }
			: undefined,
	})
}
main().catch((err) => {
	throw err
})

process.on('unhandledRejection', (err) => {
	throw err
})
