import fs from "fs";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

export default async function dbCheck() {
  const color = chalk;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const dbCreationPath = path.join(__dirname, "../db-creation");

  console.log(color.hex("#ffa500")("Checking and initializing databases..."));

  const files = fs
    .readdirSync(dbCreationPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of files) {
    const filePath = path.join(dbCreationPath, file);

    try {
      const { default: createDatabase } = await import(`file://${filePath}`);
      await createDatabase();
      console.log(color.green(`Successfully executed ${file}`));
    } catch (error) {
      console.error(color.red(`Error executing ${file}:`, error));
    }
  }

  console.log(color.green("Database check and initialization complete."));
}
