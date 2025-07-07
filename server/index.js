require('dotenv').config({path: '../.env'})
const express = require('express')
const cors = require('cors')
const {mongoose_connect, GameScore} = require('./database/index')
const path = require('path')
const bot = require('../telegrambot/index')
const app = express()
const PORT = process.env.PORT || 5000
const token = process.env.TELEGRAM_TOKEN
const domain = process.env.DOMAIN

const buildPath = path.join(__dirname, '..', 'client', 'build')

app.use(express.static(buildPath))
app.use(express.json())
app.use(cors())
bot.telegram.setWebhook(`${domain}/bot${token}`)
app.use(bot.webhookCallback(`/bot${token}`))
mongoose_connect()

app.post('/submit-score', async (req, res) => {
    const {userId, score, chat_id} = req.body
    const data = await GameScore.findOne({
        user_id: Number(userId),
        chat_id: Number(chat_id),
    }).sort({_id: -1})

    console.log(data)

    if (!data) {
        return res.status(400).json({error: 'Нет данных для пользователя'})
    }
    const data_maxScore = await GameScore.findOne({
        user_id: Number(userId),
        chat_id: Number(chat_id),
    }).sort({score: -1})
    data.score = score
    await data.save()
    console.log(data)
    try {
        if (data_maxScore.score < score) {
            await bot.telegram.setGameScore(userId, score, undefined, data.chat_id, data.message_id, true, true)
            await bot.telegram.sendMessage(data.chat_id, `Новый рекорд: ${data.username} - ${score} очков!`)
        } else await bot.telegram.sendMessage(data.chat_id, `Игрок ${data.username} набрал ${score} очков.`)
        res.json({status: 'ok'})
    } catch (err) {
        console.error('Ошибка setGameScore:', err);
        res.status(500).json({error: 'Не удалось отправить очки'});
    }
})

app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});