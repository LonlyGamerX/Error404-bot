import axios from "axios";
import chalk from "chalk";
import { ChannelType } from "discord.js";

export const name = "ready";
export const once = false;

export async function execute(bot) {
  const color = chalk;
  console.log(color.hex("#814aff")("Subscriber role system initialized!"));

  // Get environment variables
  const YOUTUBE_API_KEY = process.env.youtube_api_key;
  const YOUTUBE_CHANNEL_ID = process.env.youtube_channel_id; // Make sure to define this in .env
  const DISCORD_CHANNEL_ID = process.env.discord_channel_id;
  const SUB_ROLE_ID = process.env.sub_role;

  if (
    !YOUTUBE_API_KEY ||
    !YOUTUBE_CHANNEL_ID ||
    !DISCORD_CHANNEL_ID ||
    !SUB_ROLE_ID
  ) {
    console.error(color.red("Missing required environment variables."));
    return;
  }

  // Function to fetch subscribers from YouTube API
  const fetchSubscribers = async () => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}&maxResults=50`
      );

      const subscribers = response.data.items.map(
        (item) => item.snippet.resourceId.channelId
      );
      return subscribers;
    } catch (error) {
      console.error(color.red("Error fetching YouTube subscribers:", error));
      return [];
    }
  };

  // Function to update subscriber roles
  const updateSubscriberRoles = async () => {
    try {
      const guild = bot.guilds.cache.get(DISCORD_CHANNEL_ID);
      if (!guild) {
        console.error(color.red("Guild (server) not found."));
        return;
      }

      const subscribers = await fetchSubscribers();

      guild.members.fetch().then((members) => {
        members.forEach((member) => {
          // Check if member's YouTube account is linked (this is an assumption)
          if (subscribers.includes(member.user.id)) {
            // Add the role if they are subscribed
            if (!member.roles.cache.has(SUB_ROLE_ID)) {
              member.roles.add(SUB_ROLE_ID);
              console.log(
                color.green(`✅ Assigned subscriber role to ${member.user.tag}`)
              );
            }
          } else {
            // Remove the role if they are not subscribed
            if (member.roles.cache.has(SUB_ROLE_ID)) {
              member.roles.remove(SUB_ROLE_ID);
              console.log(
                color.red(`❌ Removed subscriber role from ${member.user.tag}`)
              );
            }
          }
        });
      });
    } catch (error) {
      console.error(color.red("Error updating subscriber roles:", error));
    }
  };

  // Run role check every 1 hour
  setInterval(updateSubscriberRoles, 60 * 60 * 1000);
}
