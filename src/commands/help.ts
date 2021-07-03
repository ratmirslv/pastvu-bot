import { BotContext } from '../index'

const helpText = (userName = 'друг') =>
	`Привет, ${userName}! Я - бот отправки исторических фотографий.
Пришли мне сввои координаты, и я отправлю исторические фотографии, которые были сняты в этом месте.`

export function help(ctx: BotContext): Promise<unknown> {
	return ctx.reply(helpText(ctx.message?.from.first_name))
}
