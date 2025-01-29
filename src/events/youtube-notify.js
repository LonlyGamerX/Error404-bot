import axios from "axios";
import chalk from "chalk";
import { ChannelType } from "discord.js";
import {
  getDuplicateCount,
  incrementDuplicateCount,
  resetDuplicateCount,
} from "../data/DupeCountData.js";

export const name = "ready";
export const once = false;

export async function execute(bot) {
  const color = chalk;
  console.log(color.hex("#814aff")("YouTube notification system initialized!"));

  // Get environment variables
  const YOUTUBE_API_KEY = process.env.youtube_api_key;
  const YOUTUBE_HANDLE = process.env.youtube_handle;
  const DISCORD_CHANNEL_ID = process.env.discord_channel_id;

  if (!YOUTUBE_API_KEY || !YOUTUBE_HANDLE || !DISCORD_CHANNEL_ID) {
    console.error(color.red("Missing required environment variables."));
    return;
  }

  let YOUTUBE_CHANNEL_ID = null;
  let lastVideoId = null;
  let lastPostTime = null; // Track the time the last video was posted
  let checkInterval = 1.5 * 60 * 60 * 1000; // Default: 1 hour 30 minutes

  // Resolve the channel ID from the YouTube handle
  const resolveChannelId = async () => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${YOUTUBE_HANDLE}&type=channel&key=${YOUTUBE_API_KEY}`
      );

      if (response.data.items.length > 0) {
        YOUTUBE_CHANNEL_ID = response.data.items[0].id.channelId;
        console.log(
          color.green(
            `Resolved handle ${YOUTUBE_HANDLE} to channel ID: ${YOUTUBE_CHANNEL_ID}`
          )
        );
      } else {
        console.error(
          color.red(`No channel found for handle: ${YOUTUBE_HANDLE}`)
        );
      }
    } catch (error) {
      console.error(color.red("Error resolving channel ID:", error));
    }
  };

  await resolveChannelId();

  if (!YOUTUBE_CHANNEL_ID) {
    console.error(
      color.red("Failed to resolve channel ID. Exiting YouTube monitoring.")
    );
    return;
  }

  // Function to check if the video URL already exists in the last 10 messages
  const isUrlInChannel = async (channel, videoUrl) => {
    try {
      const messages = await channel.messages.fetch({ limit: 10 });
      return messages.some((message) => message.content.includes(videoUrl));
    } catch (error) {
      console.error(color.red("Error checking channel messages:", error));
      return false;
    }
  };

  // Function to check for new videos
  const checkForNewVideos = async () => {
    try {
      const now = Date.now();

      // If we posted within the last 24 hours, skip this check
      if (lastPostTime && now - lastPostTime < 24 * 60 * 60 * 1000) {
        console.log(
          color.yellow(
            `Skipping YouTube API check. Last video posted within 24 hours.`
          )
        );
        return;
      }

      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=1`
      );

      if (response.data.items.length > 0) {
        const latestVideo = response.data.items[0];
        const videoId = latestVideo.id.videoId;
        const videoTitle = latestVideo.snippet.title;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const channel = bot.channels.cache.get(DISCORD_CHANNEL_ID);

        if (
          channel &&
          (channel.type === ChannelType.GuildText ||
            channel.type === ChannelType.GuildAnnouncement)
        ) {
          // Check if the video URL already exists in the last 10 messages
          const urlExists = await isUrlInChannel(channel, videoUrl);

          if (urlExists) {
            console.log(
              color.yellow(`Video URL already exists in channel: ${videoUrl}`)
            );
            return;
          }

          // If a new video is found
          if (videoId === lastVideoId) {
            incrementDuplicateCount();
            console.log(
              color.yellow(
                `Already posted video "${videoTitle}". Duplicate count: x${getDuplicateCount()}`
              )
            );
            return;
          }

          resetDuplicateCount();

          // Post the video URL to the channel
          lastVideoId = videoId;
          lastPostTime = now; // Update last post time
          await channel.send(
            `@everyone 🎥 New video uploaded: **${videoTitle}**\nWatch it here: ${videoUrl}`
          );
          console.log(
            color.blue(`Posted a new video notification for "${videoTitle}".`)
          );

          // Set cooldown to 24 hours after posting
          checkInterval = 24 * 60 * 60 * 1000;
        } else {
          console.error(
            color.red(
              "Discord channel not found or is not a text/announcement channel."
            )
          );
        }
      } else {
        console.log(color.yellow("No new videos found."));
      }
    } catch (error) {
      console.error(color.red("Error checking YouTube API:", error));
    }
  };

  // Check for new videos initially
  checkForNewVideos();

  // Set dynamic interval for subsequent checks
  setInterval(async () => {
    await checkForNewVideos();
    // Reset to default interval if no video is posted
    if (!lastPostTime || Date.now() - lastPostTime >= 24 * 60 * 60 * 1000) {
      checkInterval = 1.5 * 60 * 60 * 1000; // 1 hour 30 minutes
    }
  }, checkInterval);
}
