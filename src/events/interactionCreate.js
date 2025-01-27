import chalk from "chalk";

export const name = "interactionCreate";
export const once = false;

export async function execute(interaction, bot) {
  const color = chalk;

  if (!interaction.isCommand()) return;

  const command = bot.commands.get(interaction.commandName);
  if (!command) {
    console.error(
      color.red(`No command matching ${interaction.commandName} was found.`)
    );
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(
      color.red(`Error executing command ${interaction.commandName}:`, error)
    );
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
}
