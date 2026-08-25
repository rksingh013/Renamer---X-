document.addEventListener("DOMContentLoaded", function () {
  const renameForm = document.getElementById("renameForm");
  const output = document.getElementById("output");
  const fileList = document.getElementById("fileList");

  renameForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const directoryPath = document.getElementById("directoryPath").value;
    const find = document.getElementById("find").value;
    const replace = document.getElementById("replace").value;

    try {
      const response = await fetch("/rename", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          directoryPath,
          find,
          replace,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! Status: ${response.status}`);
      }

      fileList.innerHTML = "";

      if (
        data.renamed.length === 0 &&
        data.skipped.length === 0 &&
        data.failed.length === 0
      ) {
        fileList.innerHTML = "<li>No files renamed.</li>";
      } else {
        // Successfully renamed
        data.renamed.forEach((file) => {
          const li = document.createElement("li");

          li.textContent = `✓ ${file.original} → ${file.target}`;

          fileList.appendChild(li);
        });

        // Skipped files
        data.skipped.forEach((file) => {
          const li = document.createElement("li");

          li.textContent = `⚠ ${file.original} → ${file.target} (${file.reason})`;

          li.classList.add("rename-skipped");

          fileList.appendChild(li);
        });

        // Failed files
        data.failed.forEach((file) => {
          const li = document.createElement("li");

          li.textContent = `✕ ${file.original} → ${file.target} (${file.reason})`;

          li.classList.add("rename-failed");

          fileList.appendChild(li);
        });
      }

      output.style.display = "block";
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  });
});
