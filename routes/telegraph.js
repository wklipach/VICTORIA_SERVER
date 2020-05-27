var express = require('express');
var router = express.Router();
const { Telegraf } = require('telegraf')

router.get('/', async function(req, res, next) {
        sendToTelegramm();
        res.send('test talegraph');
});


function sendToTelegramm() {
    process.env.bot_token = "1006099878:AAHGXxkIAYIqgYjSENZF4pgZHYM0BF9TX90";
    const bot = new Telegraf(process.env.bot_token);

    console.log('bot', bot);

    bot.start((ctx) => ctx.reply('Welcome to Victoria from Node.js!'));

//    bot.help((ctx) => ctx.reply('Send me a sticker from Node.js!'))
//    bot.on('sticker', (ctx) => ctx.reply('👍'))
//    bot.hears('hi', (ctx) => ctx.reply('Hey there from Node.js!'))
    bot.launch();

}

module.exports = router;
