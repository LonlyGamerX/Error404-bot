import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { config } from "dotenv";
import { getDuplicateCount } from "../data/DupeCountData.js";

// Load environment variables
config();

export const data = new SlashCommandBuilder()
  .setName("count")
  .setDescription(
    "Displays the current duplicateCount value from the YouTube notify event."
  );

export async function execute(interaction) {
  const developerId = process.env.developer_id; // Developer ID from .env
  const userId = interaction.user.id; // ID of the user who invoked the command

  // Restrict command to the developer
  if (userId !== developerId) {
    await interaction.reply({
      content: "❌ You are not authorized to use this command.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Respond with the current duplicateCount value
  await interaction.reply({
    content: `📊 The current duplicateCount is: **${getDuplicateCount()}**`,
    flags: MessageFlags.Ephemeral,
  });
}
