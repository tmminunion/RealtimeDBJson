document.addEventListener("DOMContentLoaded", function () {
  // Get filename from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const filename = urlParams.get("file");

  if (!filename) {
    alert("No file specified. Redirecting to dashboard.");
    window.location.href = "dashboard.html";
    return;
  }

  // Display filename
  document.getElementById(
    "filename-display"
  ).textContent = `Editing: ${filename}.json`;

  // Initialize JSONEditor
  const container = document.getElementById("jsoneditor");
  const options = {
    mode: "tree",
    modes: ["code", "tree", "form", "text", "view"],
    onError: function (err) {
      alert(err.toString());
    },
  };
  const editor = new JSONEditor(container, options);

  // Load data from server
  function loadData() {
    fetch(`/api/files/${filename}`)
      .then((response) => {
        if (!response.ok) throw new Error("File not found");
        return response.json();
      })
      .then((data) => {
        editor.set(data);
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        alert("Error loading data: " + error.message);
      });
  }

  // Save data to server
  document.getElementById("save").addEventListener("click", function () {
    const data = editor.get();

    fetch(`/api/files/${filename}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to save");
        return response.json();
      })
      .then((result) => {
        alert(result.message);
      })
      .catch((error) => {
        console.error("Error saving data:", error);
        alert("Error saving data: " + error.message);
      });
  });

  // Reload button
  document.getElementById("reload").addEventListener("click", loadData);

  // Initial load
  loadData();
});
