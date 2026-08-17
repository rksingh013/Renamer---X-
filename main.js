const fs = require('fs').promises;
const readline = require('readline');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(), // Logs to console only
  ],
});

async function bulkRename(directoryPath, find, replace) {
  try {
    const files = await fs.readdir(directoryPath);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      `You are about to rename ${files.length} files. Press Enter to proceed or any other key to cancel the process: `,
      async (answer) => {
        if (answer.trim() === '') {
          for (const file of files) {
            const newName = file.replace(find, replace);
            await fs.rename(
              `${directoryPath}/${file}`,
              `${directoryPath}/${newName}`
            );
            logger.info(`Renamed: ${file} to ${newName}`);
          }
          logger.info('Bulk renaming completed successfully.');
        } else {
          logger.info('Bulk renaming canceled.');
        }

        rl.close();
      }
    );
  } catch (error) {
    logger.error('Error during bulk rename:', error);
  }
}

// Fill Your data here: 1-path of the folder 2-Rename this 3-rename to :
bulkRename('C:\\Users\\offic\\Desktop\\Demo Files', 'ravi', 'RK');
 