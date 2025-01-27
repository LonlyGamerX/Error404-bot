import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { config } from "dotenv";

// Load environment variables
config();

export const data = new SlashCommandBuilder()
  .setName("clear")
  .setDescription("Deletes a specified number of messages in the chat (1-100).")
  .addIntegerOption((option) =>
    option
      .setName("amount")
      .setDescription("The number of messages to delete (1-100)")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100)
  );

export async function execute(interaction) {
  const ownerId1 = process.env.developer_id; // First owner ID from .env
  const ownerId2 = process.env.editor_id; // Second owner ID from .env
  const userId = interaction.user.id; // ID of the user who invoked the command

  // Restrict command to the specified owners
  if (userId !== ownerId1 && userId !== ownerId2) {
    await interaction.reply({
      content: "❌ You are not authorized to use this command.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const amount = interaction.options.getInteger("amount");

  // Check if the bot has permission to manage messages
  if (!interaction.guild.members.me.permissions.has("ManageMessages")) {
    await interaction.reply({
      content:
        "I do not have the `Manage Messages` permission required to delete messages.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Ensure the channel is a text-based channel
  const channel = interaction.channel;
  if (!channel.isTextBased()) {
    await interaction.reply({
      content: "This command can only be used in text-based channels.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    // Bulk delete messages
    const deletedMessages = await channel.bulkDelete(amount, true); // 'true' skips messages older than 14 days
    await interaction.reply({
      content: `✅ Successfully deleted ${deletedMessages.size} messages!`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content:
        "❌ There was an error while trying to delete messages. Make sure I have the proper permissions!",
      flags: MessageFlags.Ephemeral,
    });
  }
}
