const fs = require("fs").promises;
const readline = require("readline");
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

function askConfirmation(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.trim() === "");
    });
  });
}

async function bulkRename(directoryPath, find, replace) {
  try {
    const files = await fs.readdir(directoryPath);

    const confirmed = await askConfirmation(
      `You are about to rename ${files.length} files. Press Enter to proceed or type anything to cancel: `,
    );

    if (!confirmed) {
      logger.info("Bulk renaming canceled.");
      return;
    }

    for (const file of files) {
      const newName = file.replace(find, replace);

      if (newName === file) {
        continue;
      }

      await fs.rename(
        `${directoryPath}/${file}`,
        `${directoryPath}/${newName}`,
      );

      logger.info(`Renamed: ${file} to ${newName}`);
    }

    logger.info("Bulk renaming completed successfully.");
  } catch (error) {
    logger.error(`Error during bulk rename: ${error.message}`);
  }
}

// Fill your data here:
// 1 - path of folder
// 2 - Rename this
// 3 - Rename to
bulkRename("C:\Users\offic\Desktop\New folder", "rt", "RK");
