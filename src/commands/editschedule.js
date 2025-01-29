import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { config } from "dotenv";
import { addToSchedule } from "../data/scheduleData.js";

config();

export const data = new SlashCommandBuilder()
  .setName("editschedule")
  .setDescription("Edit the upload or live stream schedule.")
  .addStringOption((option) =>
    option
      .setName("title")
      .setDescription("The title of the video or event.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("date")
      .setDescription("The date of the event (dd/mm).")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("time")
      .setDescription("The time of the event (e.g., 6:00 PM).")
      .setRequired(true)
  );

export async function execute(interaction) {
  const roleId = process.env.role_id;
  const userRoles = interaction.member.roles.cache;

  if (!userRoles.has(roleId)) {
    await interaction.reply({
      content: "❌ You do not have permission to use this command.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const title = interaction.options.getString("title");
  const date = interaction.options.getString("date");
  const time = interaction.options.getString("time");

  await addToSchedule({ title, date, time });

  await interaction.reply({
    content: `✅ The schedule has been updated:\n- **"${title}"** on ${date} at around ${time}.`,
    flags: MessageFlags.Ephemeral,
  });
}
