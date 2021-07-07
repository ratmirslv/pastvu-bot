import 'dotenv-safe/config'
import { Telegraf, Scenes, session, Markup, Context } from 'telegraf'

import * as commands from './commands'
import { PastvuItem } from './helpers/getPastvuPhotos'
import { pastvu } from './scenes/pastvu'

if (process.env.BOT_TOKEN === undefined) {
	throw new TypeError('BOT_TOKEN must be provided!')
}
interface BotSceneSession extends Scenes.SceneSessionData {
	pastvuData: PastvuItem[][] | undefined
	counterData: number
}

export interface ContextBot extends Context {
	scene: Scenes.SceneContextScene<ContextBot, BotSceneSession>
}

const bot = new Telegraf<ContextBot>(process.env.BOT_TOKEN)

const stage = new Scenes.Stage<ContextBot>([pastvu])

//TODO: https://github.com/telegraf/telegraf/issues/1372
bot.use(session())

bot.use(stage.middleware())

async function main() {
	bot.start((ctx) =>
		ctx.reply(
			'Отправьте местоположение, для получения фотографий',
			Markup.keyboard([
				Markup.button.locationRequest('🧭 Отправить местоположение'),
				Markup.button.callback('🔍 Еще фотографий', 'morePhotos'),
			]).resize(),
		),
	)

	bot.help(commands.help)

	bot.on('location', (ctx) => ctx.scene.enter('pastvu'))

	await bot.launch()
}
main().catch((err) => {
	throw err
})

process.on('unhandledRejection', (err) => {
	throw err
})
