const cron = require('node-cron');
const { postDigest } = require('./digest');

function startScheduler(client) {
  const schedule = process.env.CRON_SCHEDULE || '0 9 */3 * *';

  cron.schedule(schedule, async () => {
    console.log('[scheduler] Firing digest...');
    try {
      await postDigest(client);
    } catch (err) {
      console.error('[scheduler] Error posting digest:', err);
    }
  });

  console.log(`[scheduler] Digest scheduled — ${schedule}`);
}

module.exports = { startScheduler };