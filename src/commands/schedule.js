import { SlashCommandBuilder } from "discord.js";
import { getSchedule } from "../data/scheduleData.js";

export const data = new SlashCommandBuilder()
  .setName("schedule")
  .setDescription("Displays the planned upload or live stream schedule.");

export async function execute(interaction) {
  const schedule = await getSchedule();

  const scheduleMessages = schedule.map(
    (item) =>
      `- New video: **"${item.title}"** on ${item.date} at around ${item.time}`
  );

  const liveStreamMessage =
    "Live Stream: We currently are not planning on live streaming until the near future.";

  const response = `📅 **Upcoming Schedule:**\n${scheduleMessages.join(
    "\n"
  )}\n\n${liveStreamMessage}`;

  await interaction.reply({
    content: response,
    ephemeral: false,
  });
}
