const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const { bulkRename } = require("./services/renameService");
const logger = require("./utils/logger");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.json());

//Directory path validation function
async function validateDirectory(directoryPath) {
  try {
    const resolvedPath = path.resolve(directoryPath);

    const stats = await fs.stat(resolvedPath);

    if (!stats.isDirectory()) {
      return {
        valid: false,
        status: 400,
        error: "The provided path is not a directory.",
      };
    }

    return {
      valid: true,
      path: resolvedPath,
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        valid: false,
        status: 404,
        error: "The specified directory does not exist.",
      };
    }

    if (error.code === "EACCES") {
      return {
        valid: false,
        status: 403,
        error: "Permission denied. Cannot access this directory.",
      };
    }

    return {
      valid: false,
      status: 400,
      error: "Unable to access the specified directory.",
    };
  }
}
//Input validation function
function validateRenameInputs(find, replace) {
  if (typeof find !== "string" || find.trim() === "") {
    return {
      valid: false,
      error: "The 'find' value cannot be empty.",
    };
  }

  if (replace === undefined) {
    return {
      valid: false,
      error: "The 'replace' value is required.",
    };
  }

  return {
    valid: true,
  };
}

app.post("/rename", async (req, res) => {
  const { directoryPath, find, replace } = req.body;

  const inputValidation = validateRenameInputs(find, replace);

  if (!inputValidation.valid) {
    return res.status(400).json({
      success: false,
      error: inputValidation.error,
    });
  }

  const directory = await validateDirectory(directoryPath);

  if (!directory.valid) {
    return res.status(directory.status).json({
      success: false,
      error: directory.error,
    });
  }

  try {
    const result = await bulkRename(directory.path, find, replace);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Rename operation failed: ${error.message}`);

    res.status(500).json({
      success: false,
      error: "An error occurred while renaming files.",
    });
  }
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
