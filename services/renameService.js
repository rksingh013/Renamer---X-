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
    const file = entry.name;

    // Separate filename from extension
    const parsedPath = path.parse(file);
    const fileName = parsedPath.name;
    const extension = parsedPath.ext;

    // Search only inside the filename, NOT the extension
    if (!fileName.includes(find)) {
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

    // Replace only inside the filename
    const newFileName = fileName.replace(find, replace);

    // Put the original extension back unchanged
    const newName = newFileName + extension;

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