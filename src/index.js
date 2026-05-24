const { Client, GatewayIntentBits } = require('discord.js');
const { registerListeners } = require('./listener');
const { startScheduler } = require('./scheduler');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
  ]
});

client.once('clientReady', (c) => {
  console.log(`[bot] Logged in as ${c.user.tag}`);
  registerListeners(client);
  startScheduler(client);
});

client.login(process.env.DISCORD_TOKEN);