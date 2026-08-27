const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const { bulkRename } = require("./services/renameService");

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
        error: "The specified directory does not exist.",
      };
    }

    if (error.code === "EACCES") {
      return {
        valid: false,
        error: "Permission denied. Cannot access this directory.",
      };
    }

    return {
      valid: false,
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
  /*  const directoryPath = req.query.directoryPath;
    const find = req.query.find;
    const replace = req.query.replace; 
    old logic */
  const { directoryPath, find, replace } = req.body;

  const inputValidation = validateRenameInputs(find, replace);

  if (!inputValidation.valid) {
    return res.status(400).json({
      error: inputValidation.error,
    });
  }

  const directory = await validateDirectory(directoryPath);

  if (!directory.valid) {
    return res.status(400).json({
      error: directory.error,
    });
  }

  try {
    const result = await bulkRename(directory.path, find, replace);

    res.json(result);
  } catch (error) {
    console.error("Error:", error);

    res.status(500).json({
      error: "An error occurred while renaming files.",
    });
  }
  /* main rename logic is shifted from here to services>renameService.js
  try {
    const files = await fs.readdir(directoryPath);
    const renamedFiles = [];

    for (const file of files) {
      const newName = file.replace(find, replace);
      if (newName !== file) {
        await fs.rename(
          path.join(directoryPath, file),
          path.join(directoryPath, newName),
        );
        renamedFiles.push(`${file} -> ${newName}`);
      }
    }

    res.json(renamedFiles);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "An error occurred",
    });
  } */
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
