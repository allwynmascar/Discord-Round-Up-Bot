const { getPendingLinks, getPendingEvents, markLinksDigested, markEventsDigested, getRecentLinks, getRecentEvents } = require('./db');

async function postDigest(client, manual = false) {
  const links = manual ? getRecentLinks() : getPendingLinks();
  const events = manual ? getRecentEvents() : getPendingEvents();

  if (!links.length && !events.length) {
    console.log('[digest] Nothing to report, skipping.');
    return false;
  }

  const channel = await client.channels.fetch(process.env.DIGEST_CHANNEL_ID);
  if (!channel) {
    console.error('[digest] Could not find digest channel.');
    return false;
  }

  let message = `📋 **Here's what happened in the last three days**\n\n`;

  if (links.length) {
    message += `🔗 **Links shared around the server**\n`;
    for (const link of links) {
      const date = new Date(link.posted_at * 1000).toDateString();
      message += `• <${link.url}> — posted by **${link.author}** in #${link.channel} on ${date}\n`;
    }
    message += `\n`;
  }

  if (events.length) {
    message += `📅 **Upcoming events on the server**\n`;
    for (const event of events) {
      const date = event.start_time
        ? new Date(event.start_time).toDateString()
        : 'Date TBD';
      const eventUrl = `https://discord.com/events/${process.env.GUILD_ID}/${event.event_id}`;
      message += `• **${event.title}** — ${date}${event.description ? ' — ' + event.description : ''} — <${eventUrl}>\n`;
    }
  }

  await channel.send(message);
  console.log('[digest] Digest posted successfully.');

  if (!manual) {
    markLinksDigested(links.map(l => l.id));
    markEventsDigested(events.map(e => e.id));
  }

  return true;
}

module.exports = { postDigest };