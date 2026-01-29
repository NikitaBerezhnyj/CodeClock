const vscode = acquireVsCodeApi();
const timerDisplay = document.getElementById("timer");
const toggleBtn = document.getElementById("toggleBtn");

toggleBtn.addEventListener("click", () => {
  vscode.postMessage({ command: "toggleTimer" });
});

window.addEventListener("message", event => {
  const message = event.data;

  switch (message.command) {
    case "updateTimer":
      timerDisplay.textContent = message.time;
      toggleBtn.textContent = message.running ? "Stop" : "Start";
      break;
  }
});
