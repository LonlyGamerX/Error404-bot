import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { config } from "dotenv";

// Load environment variables
config();

export default async function registerCommands(bot) {
  const color = chalk;
  const { bot_id, discord_token } = process.env;

  if (!bot_id || !discord_token) {
    console.error(
      color.red("❌ Missing bot_id or discord_token in .env file.")
    );
    return;
  }

  try {
    console.log(
      color.hex("#ffa500")("🔄 Registering application (/) commands...")
    );

    const commands = [];

    // Resolve commands folder relative to this file
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const commandsPath = path.join(__dirname, "../commands");
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));

    // Load commands dynamically
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = await import(`file://${filePath}`);
      if (command.data) {
        commands.push(command.data.toJSON());
      }
    }

    const rest = new REST({ version: "10" }).setToken(discord_token);

    // Register commands globally
    await rest.put(Routes.applicationCommands(bot_id), { body: commands });

    console.log(
      color.green("✅ Successfully registered application (/) commands.")
    );
  } catch (error) {
    console.error(color.red("❌ Error registering commands:", error));
  }
}
