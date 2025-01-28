import { ActivityType } from "discord.js";
import chalk from "chalk";
import { config } from "dotenv";
import { execute as subscriberRole } from "./subscriber-role.js";

// Load environment variables
config();

export const name = "ready";
export const once = true;

export async function execute(bot) {
  const color = chalk;

  console.log(color.green(`\nLogged in as ${bot.user.tag}!`));

  // Set the bot's presence
  bot.user.setPresence({
    activities: [
      {
        name: "for new content",
        type: ActivityType.Watching,
      },
    ],
    status: "dnd",
  });

  console.log(color.green('Bot presence set to "Watching for new content".'));

  // Initialize database check
  const dbCheck = await import("./db-check.js");
  await dbCheck.default();

  // Initialize command registration
  const registerCommands = await import("./register-commands.js");
  await registerCommands.default(bot);

  // Attach the give-role event
  const giveRole = await import("./give-role.js");
  bot.on(giveRole.name, (...args) => giveRole.execute(...args));

  // Attach the subscriber-role event
  subscriberRole(bot);

  // Restrict commands to specific channel or roles
  const channelCommandId = process.env.channel_command_id;
  const specialRole1 = process.env.special_role_1;
  const specialRole2 = process.env.special_role_2;

  bot.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const userRoles = interaction.member.roles.cache;
    const isSpecialRole =
      userRoles.has(specialRole1) || userRoles.has(specialRole2);

    // Check if the interaction is in the correct channel or user has special roles
    if (interaction.channel.id !== channelCommandId && !isSpecialRole) {
      await interaction.reply({
        content: `❌ Commands can only be used in the designated channel or by users with special roles.`,
        ephemeral: true,
      });
      return;
    }

    // Execute the command
    const command = bot.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ There was an error executing this command.",
        ephemeral: true,
      });
    }
  });
}
