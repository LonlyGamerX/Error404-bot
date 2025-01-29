export const name = "error";
export const once = false;

export async function execute(error) {
  const ignoredErrors = [
    "InteractionAlreadyReplied",
    "Unknown interaction",
    "40060", // Interaction has already been acknowledged
  ];

  // Check if error message contains any ignored error
  if (ignoredErrors.some((ignored) => error.message.includes(ignored))) {
    return; // Do nothing, effectively suppressing it
  }

  console.error("Unhandled Error:", error); // Log only other errors
}
