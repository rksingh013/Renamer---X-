const fs = require("fs").promises;
const path = require("path");

/* filename validation function for generating new name */
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

/* core renaming function for all files */
async function bulkRename(directoryPath, find, replace) {
  const entries = await fs.readdir(directoryPath, {
    withFileTypes: true,
  });

  const renamed = [];
  const skipped = [];
  const failed = [];

  for (const entry of entries) {
    // #9 - Skip directories
    if (!entry.isFile()) {
      skipped.push({
        original: entry.name,
        target: entry.name,
        reason: "Directory or non-file entry. So it's skipped.",
      });

      continue;
    }

    const file = entry.name;
    const newName = file.replace(find, replace);

    if (newName === file) {
      continue;
    }

    // #6 - Validate generated filename
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

    // #5 - Check whether destination already exists
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

    // #8 - Handle individual rename failure
    try {
      await fs.rename(oldPath, newPath);

      renamed.push({
        original: file,
        target: newName,
      });
    } catch (error) {
      console.error(`Failed to rename "${file}":`, error);

      failed.push({
        original: file,
        target: newName,
        reason: "Unable to rename this file.",
      });

      continue;
    }
  }

  return {
    renamed,
    skipped,
    failed,
  };
}

module.exports = {
  bulkRename,
};
