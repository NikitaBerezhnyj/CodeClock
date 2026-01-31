import * as vscode from "vscode";
import { SidebarProvider } from "./ui/SidebarProvider";
import { StatusBar } from "./ui/StatusBar";
import { TrackerService } from "./core/TrackerService";
import { LocalStorage } from "./storage/LocalStorage";
import { WorkspaceService } from "./core/WorkspaceService";

let tracker: TrackerService | null = null;

export function activate(context: vscode.ExtensionContext) {
  console.log("[CodeClock]: Activating CodeClock extension...");

  const storage = new LocalStorage(context.globalState);
  tracker = new TrackerService(storage);

  tracker.tryAutoStart();

  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      const workspaceId = WorkspaceService.getCurrentWorkspaceId();
      if (workspaceId) {
        tracker?.switchWorkspace(workspaceId);
      } else {
        tracker?.deactivateWorkspace();
      }
    }),
    vscode.commands.registerCommand("codeclock.startTimer", () => {
      tracker?.start();
    }),
    vscode.commands.registerCommand("codeclock.stopTimer", () => {
      tracker?.stop();
    }),
    vscode.commands.registerCommand("codeclock.clearData", async () => {
      const workspaceId = WorkspaceService.getCurrentWorkspaceId();
      if (workspaceId) {
        await storage.set(`project:${workspaceId}`, null);
        await storage.set(`active-session:${workspaceId}`, null);
        vscode.window.showInformationMessage("CodeClock data cleared!");
      }
    })
  );

  const persistInterval = setInterval(() => {
    tracker?.persist();
    console.log("[CodeClock] Tick", Math.round((tracker?.getTotalMs() ?? 0) / 1000), "sec");
  }, 30_000);

  context.subscriptions.push({
    dispose() {
      clearInterval(persistInterval);
    }
  });

  const openSidebarCommand = vscode.commands.registerCommand("codeclock.openSidebar", async () => {
    await vscode.commands.executeCommand("workbench.view.extension.codeclock");
  });

  context.subscriptions.push(openSidebarCommand);

  const statusBar = new StatusBar(tracker);
  statusBar.show();
  context.subscriptions.push(statusBar);
  console.log("[CodeClock]: StatusBar initialized");

  const sidebarProvider = new SidebarProvider(context, tracker);
  sidebarProvider.activate();
  context.subscriptions.push(sidebarProvider);

  console.log("[CodeClock]: SidebarProvider initialized");
  console.log("[CodeClock]: CodeClock activated");
}

export function deactivate() {
  return tracker?.deactivateWorkspace();
}
