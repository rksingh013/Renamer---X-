const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const port = 3000;

app.use(express.static("public"));

app.get("/rename", async (req, res) => {
    const directoryPath = req.query.directoryPath;
    const find = req.query.find;
    const replace = req.query.replace;

    try {
        const files = await fs.readdir(directoryPath);
        const renamedFiles = [];
        
        for (const file of files) {
            const newName = file.replace(find, replace);
            if (newName !== file) {
                await fs.rename(path.join(directoryPath, file), path.join(directoryPath, newName));
                renamedFiles.push(`${file} -> ${newName}`);
            }
        }

        res.json(renamedFiles);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
