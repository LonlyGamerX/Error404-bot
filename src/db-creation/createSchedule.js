import mysql from "mysql2/promise";
import { config } from "dotenv";

config(); // Load environment variables

export default async function createSchedule() {
  const connection = await mysql.createConnection({
    host: process.env.host_db,
    user: process.env.user_db,
    password: process.env.password_db,
  });

  try {
    // Create the database if it doesn't exist
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.database_db}`
    );
    console.log(`Database "${process.env.database_db}" ensured.`);

    // Connect to the created database
    const dbConnection = await mysql.createConnection({
      host: process.env.host_db,
      user: process.env.user_db,
      password: process.env.password_db,
      database: process.env.database_db,
    });

    // Create the table if it doesn't exist
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS schedule (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(10) NOT NULL,
        time VARCHAR(20) NOT NULL
      );
    `);

    console.log('Table "schedule" ensured.');
    await dbConnection.end();
  } catch (error) {
    console.error("Error creating schedule database or table:", error);
  } finally {
    await connection.end();
  }
}
