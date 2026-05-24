const { Events } = require('discord.js');
const { insertLink, insertEvent } = require('./db');

// Junk URL filter — skip these domains
const JUNK_DOMAINS = [
  'discord.gg',
  'discord.com/events',
  'maps.app.goo.gl',
  'partiful.com',
  'luma.com',
  'lu.ma',
];

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;

function isJunk(url) {
  return JUNK_DOMAINS.some(domain => url.includes(domain));
}

function registerListeners(client) {

  // ── Watch all messages for links ─────────────────────────────────────────
  client.on(Events.MessageCreate, (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    const urls = message.content.match(URL_REGEX);
    if (!urls) return;

    for (const url of urls) {
      if (isJunk(url)) {
        console.log(`[listener] Skipping junk URL: ${url}`);
        continue;
      }

      insertLink({
        url,
        author: message.author.username,
        channel: message.channel.name || 'unknown',
        messageId: message.id,
        postedAt: Math.floor(message.createdTimestamp / 1000),
      });
      console.log(`[listener] Captured link from ${message.author.username}: ${url}`);
    }
  });

  // ── Watch for new Discord scheduled events ───────────────────────────────
  client.on(Events.GuildScheduledEventCreate, (event) => {
    insertEvent({
      eventId: event.id,
      title: event.name,
      description: event.description || '',
      startTime: event.scheduledStartAt
        ? event.scheduledStartAt.toISOString()
        : null,
      author: event.creator ? event.creator.username : 'unknown',
    });
    console.log(`[listener] Captured event: ${event.name}`);
  });

}

module.exports = { registerListeners };