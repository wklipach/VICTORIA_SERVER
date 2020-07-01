var express = require('express');
var router = express.Router();


/*
const TelegramBot = require('node-telegram-bot-api');
const Agent = require('socks5-https-client/lib/Agent');
const token =  "1175492418:AAHGyI3UO-DhxY0HUncwmyLxn3tUewxzY7s";
const bot = new TelegramBot( token, {
    polling: true,
    request: {
        agentClass: Agent,
        agentOptions: {
            socksHost: '45.84.226.127',
            socksPort: '9100'
        }
    }
});

*/


router.get('/', async function(req, res, next) {

    if (req.query.send_text) {
        // sendToTelegramm(req.query.nick, req.query.message);
        res.send('true');
    }

});


function sendToTelegramm(nick, victoria_text) {

    process.env.NTBA_FIX_319 = 1;
    console.log('bot', '123456.....');
    bot.sendMessage('@victoria_sbor', nick + ' ' + victoria_text + ' ' + 'http://45.84.226.127/comment-laundry');

/*
    bot.onText(/\/send (.+)/, (msg, match) => {


        const chatId = msg.chat.id;
        const resp = match[1];

        // bot.sendMessage(CHANNEL_ID, 'your message');
        bot.sendMessage('-1001410454880', '11wwwПолучили сообщение. '+msg.chat.id.toString());
        bot.sendMessage(chatId, resp);
    });


    bot.on('message', (msg) => {
        const chatId = msg.chat.id;

        bot.sendMessage('-1001410454880', '22wwwПолучили сообщение. '+msg.chat.id.toString());
        bot.sendMessage(chatId, 'Получили сообщение. '+msg.chat.id.toString());

    });
*/

    // bot.sendMessage('79312501669', 'мегатест');
    // bot.sendMessage('-1001410454880', 'левый текст');

}

module.exports = router;
