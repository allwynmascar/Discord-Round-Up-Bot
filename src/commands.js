const { REST, Routes, SlashCommandBuilder } = require('discord.js');

async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('roundup')
      .setDescription('Trigger the Roundup digest right now')
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
      await interaction.deferReply();
      console.log('[commands] /roundup triggered by', interaction.user.username);
      try {
        await postDigest(client);
        await interaction.editReply('Roundup posted to #general!');
      } catch (err) {
        console.error('[commands] Error running digest:', err);
        await interaction.editReply('Something went wrong running the roundup.');
      }
    }
  });
}

module.exports = { registerCommands, registerCommandHandlers };