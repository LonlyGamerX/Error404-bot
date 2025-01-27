import { ActivityType } from "discord.js";
import chalk from "chalk";

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
}
