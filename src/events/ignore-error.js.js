export const name = "error";
export const once = false;

export async function execute(error) {
  // Check for specific error codes to ignore
  if (error?.code === 40060) {
    // Suppress "Interaction has already been acknowledged" error
    return;
  }

  // Log other errors to the console
  console.error("Unhandled Error:", error);
}
