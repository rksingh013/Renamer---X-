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
            const response = await fetch(`/rename?directoryPath=${directoryPath}&find=${find}&replace=${replace}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            fileList.innerHTML = "";
            if (data.length === 0) {
                fileList.innerHTML = "<li>No files renamed.</li>";
            } else {
                data.forEach((fileName) => {
                    const li = document.createElement("li");
                    li.textContent = fileName;
                    fileList.appendChild(li);
                });
            }
            output.style.display = "block";
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
    });
});
