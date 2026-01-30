import * as vscode from "vscode";
import { SidebarProvider } from "./ui/SidebarProvider";
import { StatusBar } from "./ui/StatusBar";

export function activate(context: vscode.ExtensionContext) {
  console.log("[CodeClock]: Activating CodeClock extension...");

  const openSidebarCommand = vscode.commands.registerCommand("codeclock.openSidebar", async () => {
    await vscode.commands.executeCommand("workbench.view.extension.codeclock");
  });

  context.subscriptions.push(openSidebarCommand);

  const statusBar = new StatusBar();
  statusBar.show();
  context.subscriptions.push(statusBar);
  console.log("[CodeClock]: StatusBar initialized");

  const sidebarProvider = new SidebarProvider(context);
  sidebarProvider.activate();
  context.subscriptions.push(sidebarProvider);

  console.log("[CodeClock]: SidebarProvider initialized");
  console.log("[CodeClock]: CodeClock activated");
}

export function deactivate() {}
