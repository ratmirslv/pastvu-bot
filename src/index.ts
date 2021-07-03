import 'dotenv-safe/config'
import { Telegraf, Scenes, session, Markup } from 'telegraf'

import * as commands from './commands'
import { pastvu } from './scenes/pastvu'

if (process.env.BOT_TOKEN === undefined) {
	throw new TypeError('BOT_TOKEN must be provided!')
}

export type BotContext = Scenes.SceneContext

const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN)

const stage = new Scenes.Stage([pastvu])

//TODO: https://github.com/telegraf/telegraf/issues/1372
bot.use(session())

bot.use(stage.middleware())

async function main() {
	bot.start((ctx) =>
		ctx.reply(
			'Отправьте местоположение, для получения фотографий',
			Markup.keyboard([
				Markup.button.locationRequest('Отправить местоположение'),
			]).resize(),
		),
	)

	bot.help(commands.help)

	bot.on('text', (ctx) =>
		ctx.reply(
			'Отправьте местоположение, для получения фотографий',
			Markup.keyboard([
				Markup.button.locationRequest('Отправить местоположение'),
			]).resize(),
		),
	)

	bot.on('location', (ctx) => ctx.scene.enter('pastvu'))

	await bot.launch()
}
main().catch((err) => {
	throw err
})

process.on('unhandledRejection', (err) => {
	throw err
})
