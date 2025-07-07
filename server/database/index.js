const mongoose = require('mongoose')
const mongooseURI = process.env.MONGO_URI

const mongoose_connect = () => {
    mongoose.connect(mongooseURI, {
        dbName: 'telegram'
    }).then(() => {
        console.log('База данных - подключено')
    }).catch((err) => {
        console.error('Ошибка подключения БД: ' + err)
    })
}

const gameScoreSchema = new mongoose.Schema({
    username: {type: String, default: ''},
    user_id: {type: Number, default: 0},
    score: {type: Number, default: 0},
    chat_id: {type: Number, default: 0},
    message_id: {type: Number, default: 0},
    game_short_name: {type: String, default: ''}
}, {collection: 'game_scores', versionKey: false})

const GameScore = mongoose.models.GameScore || mongoose.model('GameScore', gameScoreSchema)


module.exports = {mongoose, GameScore, mongoose_connect}
