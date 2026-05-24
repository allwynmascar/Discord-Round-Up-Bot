const { Client, GatewayIntentBits } = require('discord.js');
const { registerListeners } = require('./listener');
const { startScheduler } = require('./scheduler');
const { registerCommands, registerCommandHandlers } = require('./commands');
const { postDigest } = require('./digest');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
  ]
});

client.once('clientReady', async (c) => {
  console.log(`[bot] Logged in as ${c.user.tag}`);
  await registerCommands();
  registerListeners(client);
  registerCommandHandlers(client, postDigest);
  startScheduler(client);
});

client.login(process.env.DISCORD_TOKEN);