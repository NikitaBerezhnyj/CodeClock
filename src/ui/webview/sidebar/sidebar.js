const vscode = acquireVsCodeApi();

const timerDisplay = document.getElementById("timer");
const toggleBtn = document.getElementById("toggleBtn");
const historySection = document.querySelector(".history-section");

toggleBtn.addEventListener("click", () => {
  vscode.postMessage({ command: "toggleTimer" });
});

function renderState(state) {
  timerDisplay.textContent = state.time;
  toggleBtn.textContent = state.running ? "Pause" : "Start";
}

// function updateHistory(data) {
//   const totalElement = historySection.querySelector(".history-total span:last-child");
//   if (totalElement) {
//     totalElement.textContent = data.totalDuration;
//   }

//   const existingItems = historySection.querySelectorAll(".history-item, .history-empty");
//   existingItems.forEach(item => item.remove());

//   const totalDiv = historySection.querySelector(".history-total");
//   if (totalDiv) {
//     totalDiv.insertAdjacentHTML("afterend", data.sessionsList);
//   }
// }
function updateHistory(data) {
  const totalElement = historySection.querySelector(".history-total span:last-child");
  if (totalElement) {
    totalElement.innerHTML = data.totalDuration;
  }

  const existingItems = historySection.querySelectorAll(".history-item, .history-empty");
  existingItems.forEach(item => item.remove());

  const totalDiv = historySection.querySelector(".history-total");
  if (totalDiv) {
    totalDiv.insertAdjacentHTML("afterend", data.sessionsList);
  }
}

window.addEventListener("message", event => {
  const { command, payload } = event.data;

  if (command === "state") {
    renderState(payload);
  } else if (command === "updateHistory") {
    updateHistory(payload);
  }
});
