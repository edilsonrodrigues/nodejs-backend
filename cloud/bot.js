const TelegramBot = require(`node-telegram-bot-api`)

const TOKEN = `957145647:AAFWm21jvqmwpZCYc9lZJoOrHyT9I6BulUE`

const bot = new TelegramBot(TOKEN, {
    polling: true
})

bot.on('new_chat_members', (msg) => {
    bot.sendMessage(msg.chat.id, `Olá ${msg.from.first_name}, bem vindo ao Devs SC!! Conte-nos um pouco sobre você, com o que trabalha e onde, se possivel é claro`)
})