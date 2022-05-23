const TeleBot = require('telebot');
const { token } = require('./config.json')
const bot = new TeleBot({
	token: token,
	pluginFolder: '../plugins/',
    	usePlugins: ['floodProtection'],
    	pluginConfig: {
        floodProtection: {
            interval: 2,
            message: 'Too many messages, relax!'
        }
    }
});
const WomboDreamApi = require('wombo-dream-api');

// STYLES -----------------------------------------------------------------------------------------
bot.on('/styles', (msg) => {
    let id = msg.from.id;
    WomboDreamApi.buildDefaultInstance()
	.fetchStyles()
	.then((styles) => {
                let ids = styles.map(a => a.id);
                let names = styles.map(a => a.name)
                let arr = ''
                for (let i = 0; i< ids.length; i++  ) {
                    arr +=ids[i]+' - '+names[i]+'\n';
                    }
                //console.log(arr)
                bot.sendMessage(id, arr)
            })


	//.catch(console.error);
});

// TEXT --------------------------------------------------------------------------------------------

bot.on('text', msg => {
    let id = msg.from.id;
    let text = msg.text;
    let args = text.split(' ').slice(1)
    let last = args.slice(-1)
    //console.log(last[0])
    if(text == '/styles') return
    if(text == '/help') return
    if(isNaN(last[0])) {
        bot.sendMessage(id, `Missing style number, /styles to view all avialable styles.`)
       return;
    }

    bot.sendMessage(id, 'Generating image, please wait...')

    WomboDreamApi.buildDefaultInstance()
	.generatePicture(text, last[0], (task) => {
		console.log(task.state, 'stage', task.photo_url_list.length);

	})
	.then((task) => bot.sendPhoto(id, task.result.final))
	.catch(console.error);
});

// HELP ---------------------------------------------------------------------------------
bot.on ('/help', (msg) => {
    let id = msg.from.id;
    bot.sendMessage(id, `Generating images using GAN (generative adversarial networks)\nTo generate image write your idea and style number at and.\nExample: Yellow portal 25\nType /styles to view all avialable styles.`)
})

// INLINE QUERY -------------------------------------------------------------------------

bot.on('inlineQuery', msg => {
    let query = msg.query;
    // Create a new answer list object
  const answers =  bot.answerList(msg.id, {cacheTime: 60})

    WomboDreamApi.buildDefaultInstance()
	.generatePicture(query, 10, (task) => {
		console.log(task.state, 'stage', task.photo_url_list.length);

	})
	.then((task) => answers.addArticle({
        id: 'query',
        title: 'Image AI',
        description: `Image:`,
        message_text: task.result.final
    }))
    .then((task) => (bot.answerQuery(answers)))
	.catch(console.error)
//---------------------------------------------------------------------------------------
    /* Article
    answers.addArticle({
        id: 'query',
        title: 'Image AI',
        description: `Image: ${ query }`,
        message_text: task?.result.final
    });
    answers.addPhoto({
        id: 'photo',
        caption: 'Telegram logo.',
        photo_url: 'https://telegram.org/img/t_logo.png',
        thumb_url: 'https://telegram.org/img/t_logo.png'
    });
    // Send answers
    return bot.answerQuery(answers); */

});


bot.connect();
