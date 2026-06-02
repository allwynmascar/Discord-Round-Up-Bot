const { REST, Routes, SlashCommandBuilder } = require('discord.js');

async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('roundup')
      .setDescription('Show everything shared on the server in the last 3 days')
      .toJSON()
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log('[commands] Registering /roundup slash command...');
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
    console.log('[commands] /roundup command registered successfully.');
  } catch (err) {
    console.error('[commands] Failed to register command:', err);
  }
}

function registerCommandHandlers(client, postDigest) {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'roundup') {
      await interaction.deferReply({ ephemeral: true });
      console.log('[commands] /roundup triggered by', interaction.user.username);
      try {
        const posted = await postDigest(client, true);
        if (posted) {
          await interaction.editReply('Roundup posted to #general!');
        } else {
          await interaction.editReply('Nothing new to report in the last 3 days.');
        }
      } catch (err) {
        console.error('[commands] Error running digest:', err);
        await interaction.editReply('Something went wrong running the roundup.');
      }
    }
  });
}

module.exports = { registerCommands, registerCommandHandlers };