import { Markup } from 'telegraf'

import { ContextBot } from '../index'

const helpText = (userName = 'друг') =>
	`Привет, ${userName}! Я - бот отправки исторических фотографий с сайта pastvu.com.
Пришли мне свое местоположение, и я отправлю исторические фотографии, которые были сняты в этом месте.`

export function help(ctx: ContextBot): Promise<unknown> {
	return ctx.reply(
		helpText(ctx.message?.from.first_name),
		Markup.keyboard([
			Markup.button.locationRequest('🧭 Отправить местоположение'),
			Markup.button.callback('🔍 Еще фотографий', 'morePhotos'),
		]).resize(),
	)
}
