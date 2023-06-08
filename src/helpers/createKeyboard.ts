import { Markup } from 'telegraf'
import { ReplyKeyboardMarkup } from 'telegraf/src/core/types/typegram'

import { ContextBot } from '../index'

export const createKeyboard = (ctx: ContextBot): Markup.Markup<ReplyKeyboardMarkup> =>
	Markup.keyboard([
		Markup.button.locationRequest(ctx.i18n.t('buttons.location')),
		Markup.button.callback(ctx.i18n.t('buttons.morePhotos'), 'morePhotos'),
		Markup.button.callback(ctx.i18n.t('buttons.settings'), 'settings'),
	]).resize()
