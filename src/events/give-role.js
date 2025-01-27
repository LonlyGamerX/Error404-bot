import chalk from "chalk";
import { config } from "dotenv";

config(); // Load environment variables

export const name = "guildMemberAdd"; // Event name
export const once = false; // This event will run every time a new member joins

export async function execute(member) {
  const color = chalk;
  const autoRoleId = process.env.auto_role; // Role ID from .env

  if (!autoRoleId) {
    console.error(color.red("❌ Missing 'auto_role' in .env file."));
    return;
  }

  try {
    // Fetch the role by ID
    const role = await member.guild.roles.fetch(autoRoleId);

    if (!role) {
      console.error(
        color.red(
          `❌ Role with ID "${autoRoleId}" does not exist in the server.`
        )
      );
      return;
    }

    // Assign the role to the new member
    await member.roles.add(role);
    console.log(
      color.green(
        `✅ Successfully assigned role "${role.name}" to new member "${member.user.tag}".`
      )
    );
  } catch (error) {
    console.error(
      color.red(
        `❌ Failed to assign role to member "${member.user.tag}":`,
        error
      )
    );
  }
}
