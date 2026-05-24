const { getPendingLinks, getPendingEvents, markLinksDigested, markEventsDigested } = require('./db');

async function postDigest(client) {
  const links = getPendingLinks();
  const events = getPendingEvents();

  // Skip if nothing to report
  if (!links.length && !events.length) {
    console.log('[digest] Nothing to report, skipping.');
    return;
  }

  const channel = await client.channels.fetch(process.env.DIGEST_CHANNEL_ID);
  if (!channel) {
    console.error('[digest] Could not find digest channel.');
    return;
  }

  let message = `📋 **Here's what happened in the last three days**\n\n`;

  // ── Links section ────────────────────────────────────────────────────────
  if (links.length) {
    message += `🔗 **Links shared around the server**\n`;
    for (const link of links) {
      const date = new Date(link.posted_at * 1000).toDateString();
      message += `• ${link.url} — posted by **${link.author}** in #${link.channel} on ${date}\n`;
    }
    message += `\n`;
  }

  // ── Events section ───────────────────────────────────────────────────────
  if (events.length) {
    message += `📅 **Upcoming events on the server**\n`;
    for (const event of events) {
      const date = event.start_time
        ? new Date(event.start_time).toDateString()
        : 'Date TBD';
      message += `• **${event.title}** — ${date}`;
      if (event.description) message += ` — ${event.description}`;
      message += `\n`;
    }
  }

  // Post to channel
  await channel.send(message);
  console.log('[digest] Digest posted successfully.');

  // Mark everything as digested so it won't appear next time
  markLinksDigested(links.map(l => l.id));
  markEventsDigested(events.map(e => e.id));
}

module.exports = { postDigest };