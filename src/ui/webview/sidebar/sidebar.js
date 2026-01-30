const vscode = acquireVsCodeApi();
const timerDisplay = document.getElementById("timer");
const toggleBtn = document.getElementById("toggleBtn");

toggleBtn.addEventListener("click", () => {
  vscode.postMessage({ command: "toggleTimer" });
});

function renderState(state) {
  timerDisplay.textContent = state.time;
  toggleBtn.textContent = state.running ? "Pause" : "Start";
}

window.addEventListener("message", event => {
  const { command, payload } = event.data;

  if (command === "state") {
    renderState(payload);
  }
});
