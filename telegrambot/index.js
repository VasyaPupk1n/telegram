require('dotenv').config({ path: '../.env' })
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.TELEGRAM_TOKEN)
const {GameScore} = require('../server/database/index')

bot.command('game', async (ctx) => {
    const message = await ctx.replyWithGame('bobik')

    await GameScore.create({
        username: ctx.from.username,
        user_id: ctx.from.id,
        chat_id: ctx.chat.id,
        message_id: message.message_id,
        game_short_name: 'bobik'

    })
});

bot.command('topscores', async (ctx) => {

    const chat = await GameScore.findOne({
        chat_id: ctx.chat.id
    })

    if (!chat) return ctx.reply('В этом чате ещё не играли.')

    try {
        const scores = await bot.telegram.getGameHighScores(ctx.from.id, undefined, chat.chat_id, ctx.message.message_id)

        if (!scores.length) return ctx.reply('Пока нет очков.')

        const text = scores.map((s, i) =>
            `${i + 1}. ${s.user.first_name}: ${s.score}`
        ).join('\n')

        await ctx.reply(`🏆 Топ игроков:\n${text}`)
    } catch (e) {
        console.error('Ошибка при получении очков:', e)
        ctx.reply('Ошибка при получении очков')
    }
})

bot.on('callback_query', async (ctx) => {
    if (ctx.callbackQuery.game_short_name === 'bobik') {
        return ctx.answerGameQuery(`https://pet-149c.onrender.com/?user_id=${ctx.from.id}&chat_id=${ctx.chat.id}`)
    }
})

module.exports = bot
