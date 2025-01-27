import mysql from "mysql2/promise";
import { config } from "dotenv";

// Load environment variables
config();

// Create a connection pool for MySQL
const pool = mysql.createPool({
  host: process.env.host_db,
  user: process.env.user_db,
  password: process.env.password_db,
  database: process.env.database_db,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to get the schedule from the database
export const getSchedule = async () => {
  try {
    const [rows] = await pool.query("SELECT title, date, time FROM schedule");
    return rows; // Returns an array of schedule objects
  } catch (error) {
    console.error("Error fetching schedule from database:", error);
    throw error;
  }
};

// Function to add an item to the schedule in the database
export const addToSchedule = async (item) => {
  const { title, date, time } = item;
  try {
    await pool.query(
      "INSERT INTO schedule (title, date, time) VALUES (?, ?, ?)",
      [title, date, time]
    );
    console.log(`Added to schedule: ${title} on ${date} at ${time}`);
  } catch (error) {
    console.error("Error adding to schedule in database:", error);
    throw error;
  }
};

// Function to overwrite the entire schedule
export const setSchedule = async (newSchedule) => {
  try {
    // Clear the current schedule
    await pool.query("TRUNCATE TABLE schedule");

    // Insert new schedule items
    for (const item of newSchedule) {
      const { title, date, time } = item;
      await pool.query(
        "INSERT INTO schedule (title, date, time) VALUES (?, ?, ?)",
        [title, date, time]
      );
    }

    console.log("Schedule successfully updated.");
  } catch (error) {
    console.error("Error overwriting schedule in database:", error);
    throw error;
  }
};
