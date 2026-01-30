import * as vscode from "vscode";

export class LocalStorage {
  constructor(private memento: vscode.Memento) {}

  get<T>(key: string, fallback: T): T {
    return this.memento.get<T>(key, fallback);
  }

  async set<T>(key: string, value: T) {
    await this.memento.update(key, value);
  }
}
