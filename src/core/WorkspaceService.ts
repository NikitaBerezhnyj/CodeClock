import * as vscode from "vscode";
import * as path from "path";

export class WorkspaceService {
  static getCurrentWorkspaceId(): string | null {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      return null;
    }

    return folders[0].uri.fsPath;
  }

  static getWorkspaceName(): string | null {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      return null;
    }

    return path.basename(folders[0].uri.fsPath);
  }
}
