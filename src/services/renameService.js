const fs = require("fs").promises;
const path = require("path");

const logger = require("../utils/logger");

/* Filename validation function for generating new name */
function validateFilename(filename) {
  const invalidCharacters = /[<>:"/\\|?*]/;

  if (invalidCharacters.test(filename)) {
    return {
      valid: false,
      reason: "Filename contains invalid characters.",
    };
  }

  if (filename.endsWith(" ") || filename.endsWith(".")) {
    return {
      valid: false,
      reason: "Filename cannot end with a space or period.",
    };
  }

  return {
    valid: true,
  };
}

/* Generate new filename while keeping extension unchanged */
function generateNewName(file, find, replace) {
  const parsedPath = path.parse(file);

  const fileName = parsedPath.name;
  const extension = parsedPath.ext;

  // Only rename files whose filename exactly matches find
  if (fileName !== find) {
    return null;
  }

  return replace + extension;
}

/* Core bulk renaming function */
async function bulkRename(directoryPath, find, replace) {
  const entries = await fs.readdir(directoryPath, {
    withFileTypes: true,
  });

  const renamed = [];
  const skipped = [];
  const failed = [];

  for (const entry of entries) {
    const file = entry.name;

    // Generate target name
    const newName = generateNewName(file, find, replace);

    // Ignore entries whose filename does not exactly match find
    if (newName === null) {
      continue;
    }

    // Check file type only for matching entries
    if (!entry.isFile()) {
      skipped.push({
        original: file,
        target: file,
        reason: "Matching entry is not a file.",
      });

      continue;
    }

    // Validate generated filename
    const filenameValidation = validateFilename(newName);

    if (!filenameValidation.valid) {
      skipped.push({
        original: file,
        target: newName,
        reason: filenameValidation.reason,
      });

      continue;
    }

    const oldPath = path.join(directoryPath, file);
    const newPath = path.join(directoryPath, newName);

    // Check whether destination already exists
    try {
      await fs.access(newPath);

      skipped.push({
        original: file,
        target: newName,
        reason: "Target file already exists.",
      });

      continue;
    } catch (error) {
      if (error.code !== "ENOENT") {
        failed.push({
          original: file,
          target: newName,
          reason: "Unable to check target file.",
        });

        continue;
      }
    }

    // Rename matching file
    try {
      await fs.rename(oldPath, newPath);

      renamed.push({
        original: file,
        target: newName,
      });
    } catch (error) {
      logger.error(`Failed to rename "${file}": ${error.message}`);

      failed.push({
        original: file,
        target: newName,
        reason: "Unable to rename this file.",
      });
    }
  }

  return {
    renamed,
    skipped,
    failed,
    summary: {
      total: renamed.length + skipped.length + failed.length,
      renamed: renamed.length,
      skipped: skipped.length,
      failed: failed.length,
    },
  };
}

module.exports = {
  bulkRename,
};
