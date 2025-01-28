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

  // Function to check for new videos
  const checkForNewVideos = async () => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=1`
      );

      if (response.data.items.length > 0) {
        const latestVideo = response.data.items[0];
        const videoId = latestVideo.id.videoId;
        const videoTitle = latestVideo.snippet.title;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const channel = bot.channels.cache.get(DISCORD_CHANNEL_ID);

        if (channel && channel.type === ChannelType.GuildText) {
          if (videoId === lastVideoId) {
            incrementDuplicateCount();
            if (getDuplicateCount() === 288) {
              console.log(
                color.yellow(
                  `Already posted video "${videoTitle}". Duplicate count: x288`
                )
              );
              resetDuplicateCount();
            }
            return;
          }

          // If a new video is found
          if (getDuplicateCount() > 0) {
            console.log(
              color.yellow(
                `Already posted video "${videoTitle}". Duplicate count: x${getDuplicateCount()}`
              )
            );
          }
          resetDuplicateCount();

          lastVideoId = videoId;

          // Send the old-style message
          await channel.send(
            `@everyone 🎥 New video uploaded: **${videoTitle}**\nWatch it here: ${videoUrl}`
          );
          console.log(
            color.blue(`Posted a new video notification for "${videoTitle}".`)
          );
        } else {
          console.error(
            color.red("Discord channel not found or is not a text channel.")
          );
        }
      }
    } catch (error) {
      console.error(color.red("Error checking YouTube API:", error));
    }
  };

  // Check for new videos every 10 minutes
  setInterval(checkForNewVideos, 10 * 60 * 1000);
}
