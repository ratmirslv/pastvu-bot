import { createKeyboard } from '../helpers/createKeyboard'
import { ContextBot } from '../index'

export function help(ctx: ContextBot): Promise<unknown> {
	return ctx.reply(
		ctx.i18n.t('help', {
			userName: ctx.message?.from.first_name,
		}),
		createKeyboard(ctx),
	)
}
