import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import axios from "axios";
import mysql from "mysql2/promise";
import { config } from "dotenv";

// Load environment variables
config();

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Displays the API status, database status, and latencies.");

export async function execute(interaction) {
  const startTime = Date.now(); // Start time for YouTube API latency measurement

  // Fetch YouTube API status and latency
  let youtubeStatus = "Offline";
  let youtubePing = "N/A";
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?key=${process.env.youtube_api_key}&part=snippet&q=test&maxResults=1`
    );
    youtubeStatus = "Online";
    youtubePing = `${Date.now() - startTime}ms`; // Round-trip latency to YouTube API
  } catch (error) {
    youtubeStatus = "Offline";
    youtubePing = "Error";
    console.error("YouTube API error:", error);
  }

  // Database status and latency
  let databaseStatus = "Offline";
  let databasePing = "N/A";
  const dbStartTime = Date.now(); // Start time for database latency measurement
  try {
    const connection = await mysql.createConnection({
      host: process.env.host_db,
      user: process.env.user_db,
      password: process.env.password_db,
      database: process.env.database_db,
    });

    await connection.ping(); // Test the database connection
    databaseStatus = "Online";
    databasePing = `${Date.now() - dbStartTime}ms`; // Round-trip latency to database
    await connection.end();
  } catch (error) {
    databaseStatus = "Offline";
    databasePing = "Error";
    console.error("Database error:", error);
  }

  // WebSocket latency (round-trip latency between Discord and the bot)
  const websocketPing = interaction.client.ws.ping;

  // Create the embedded message
  const embed = new EmbedBuilder()
    .setColor("#814aff") // Purple color
    .setTitle("📊 Status and Latency\n")
    .addFields(
      {
        name: "API Status", // Right-side section
        value: `• YouTube: ${youtubeStatus}\n• Database: ${databaseStatus}\n`,
      },
      {
        name: "Latency", // Left-side section
        value: `• YouTube: ${youtubePing}\n• Database: ${databasePing}\n• Discord: ${websocketPing}ms\n`,
      }
    )
    .setFooter({ text: "Ping command with WebSocket latency" })
    .setTimestamp();

  // Send the embedded message
  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}
