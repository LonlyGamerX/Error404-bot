import { SlashCommandBuilder } from "discord.js";
import axios from "axios";
import chalk from "chalk";

export const data = new SlashCommandBuilder()
  .setName("status")
  .setDescription(
    "Displays how long it’s been since the last video was uploaded on the channel."
  );

export async function execute(interaction) {
  const color = chalk;
  const YOUTUBE_API_KEY = process.env.youtube_api_key;
  const YOUTUBE_CHANNEL_ID = process.env.youtube_channel_id;

  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    await interaction.reply({
      content:
        "The YouTube API key or channel ID is not configured. Please check the bot settings.",
      ephemeral: true,
    });
    return;
  }

  try {
    // Fetch the latest video from the channel
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=1`
    );

    if (response.data.items.length > 0) {
      const latestVideo = response.data.items[0];
      const videoTitle = latestVideo.snippet.title;
      const videoPublishedAt = new Date(latestVideo.snippet.publishedAt);

      // Calculate the time difference
      const now = new Date();
      const timeDifference = now - videoPublishedAt; // Time in milliseconds
      const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);

      // Create a response message
      const timeString = `${days} days, ${hours} hours, and ${minutes} minutes ago`;
      await interaction.reply(
        `🎥 The latest video on the channel was **"${videoTitle}"**, uploaded ${timeString}.`
      );
    } else {
      await interaction.reply("No videos found on this channel.");
    }
  } catch (error) {
    console.error(color.red("Error fetching data from YouTube API:", error));
    await interaction.reply({
      content:
        "❌ There was an error fetching the latest video information. Please try again later.",
      ephemeral: true,
    });
  }
}
