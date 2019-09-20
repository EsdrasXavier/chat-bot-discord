const dotenv = require('dotenv');
dotenv.config();

const AssistantV2 = require('ibm-watson/assistant/v2');
const Discord = require('discord.js');
const bot = new Discord.Client();

bot.login(process.env.DISCORD_BOT_LOGIN);

const assistant = new AssistantV2({
  version: process.env.IBM_VERSION,
  iam_apikey: process.env.IBM_API_KEY,
  url: process.env.IBM_URL
});

var on = true;
var session_id = null;

function sendMsg(data, message) {
  console.log(data)
  assistant.message({
    assistant_id: process.env.IBM_ASSISTANT_ID,
    session_id: `${session_id}`,
    input: {
      'message_type': 'text',
      'text': data
    }
  }).then(res => {
    if (res['output']['intents'].length) {
      var response = res['output']['generic'][0]['text'];
      var confidence = res['output']['intents'][0]['confidence'];

      if (confidence >= 0.95) {
        console.log(response)
        console.log(confidence);
        message.channel.send(response);
      }
    } else {
      message.channel.send('Desculpa. Nao entendi, poderia repetir?');
    }
  }).catch(err => {
    console.log(err);
  });
}

assistant.createSession({
  assistant_id: 'ce72666d-1a11-4c83-bd51-bb04c6675b80'
}).then(res => {
  session_id = res['session_id']; // JSON.stringify(res, null, 2)['session_id'];
}).catch(err => {
  console.log(err);
});


bot.once('ready', () => {
  console.log(`Bot online: ${bot.user.tag}`);
});

bot.on('guildMemberAdd', (member) => {
  member.send(`Seja bem vindo! Siga as regras e divirta-se`);
});

bot.on('message', (message) => {
  // Avoid awnser him self and can enable or disable
  if (message.author.bot === false) {
    if (message.content === '!enable') {
      if (on) message.channel.send('Ja estou ligado!')
      else {
        on = true;
        message.channel.send('Ligando chat bot');
      }
    } else if (message.content === '!disable') {
      if (on) {
        on = false;
        message.channel.send('Desligando');
      } else {
        message.channel.send('Ja estou ligado!')
      }
    } else if (on) {
      sendMsg(message.content, message)
    }
  }
});