import { Client, GatewayIntentBits, Collection } from "discord.js";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
config();

// Bot setup
const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

bot.commands = new Collection();

// Load commands dynamically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  bot.commands.set(command.data.name, command);
}

// Event handler
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = await import(`file://${filePath}`);
  if (event.once) {
    bot.once(event.name, (...args) => event.execute(...args, bot));
  } else {
    bot.on(event.name, (...args) => event.execute(...args, bot));
  }
}

// Login to Discord
bot.login(process.env.discord_token);
