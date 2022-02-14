import 'dotenv-safe/config'
import { Telegraf, Scenes, session, Markup, Context } from 'telegraf'
import TelegrafSessionLocal from 'telegraf-session-local'

import * as commands from './commands'
import { PastvuItem } from './helpers/getPastvuPhotos'
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
}

const bot = new Telegraf<ContextBot>(process.env.BOT_TOKEN)

const stage = new Scenes.Stage<ContextBot>([pastvu, settings])

const localSession = new TelegrafSessionLocal({
	database: 'db/settings.json',
})

//TODO: https://github.com/telegraf/telegraf/issues/1372
bot.use(localSession.middleware('data'))
bot.use(session())

bot.use(stage.middleware())

async function main() {
	bot.start((ctx) => {
		return ctx.reply(
			'Отправьте местоположение, для получения фотографий',
			Markup.keyboard([
				Markup.button.locationRequest('🧭 Отправить местоположение'),
				Markup.button.callback('🔍 Еще фотографий', 'morePhotos'),
				Markup.button.callback('⚙️ Настройки', 'settings'),
			]).resize(),
		)
	})

	bot.help(commands.help)

	bot.on('location', (ctx) => ctx.scene.enter('pastvu'))

	bot.hears('⚙️ Настройки', (ctx) => ctx.scene.enter('settings'))

	await bot.launch({
		webhook: process.env.WEBHOOK_URL
			? {
					port: process.env.PORT ? Number(process.env.PORT) : 8080,
					hookPath: process.env.WEBHOOK_URL,
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
