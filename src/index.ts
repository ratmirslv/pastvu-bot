import 'dotenv-safe/config'
import { Telegraf, Scenes, session } from 'telegraf'

if (process.env.BOT_TOKEN === undefined) {
	throw new TypeError('BOT_TOKEN must be provided!')
}

export type BotContext = Scenes.SceneContext

const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN)

//TODO: https://github.com/telegraf/telegraf/issues/1372
bot.use(session())

async function main() {
	bot.on('text', (ctx) => ctx.reply('Hello'))
	await bot.launch()
}
main().catch((err) => {
	throw err
})

process.on('unhandledRejection', (err) => {
	throw err
})
