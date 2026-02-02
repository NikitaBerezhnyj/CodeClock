# CodeClock

This README is available in [English :uk:](#codeclock-uk) and [Ukrainian :ukraine:](#codeclock-ukraine)

## CodeClock :uk:

<p align='center'>
  <img src='assets/icon.png' alt='Extension Icon' style="width:50%">
</p>

## Overview

CodeClock is a time tracking extension for Visual Studio Code that automatically tracks the time you spend coding in each workspace. It monitors your activity, pauses during idle periods, and provides detailed statistics about your coding sessions.

## Features

- **Automatic time tracking**: CodeClock automatically starts tracking when you open a workspace and stops when you close it.
- **Idle detection**: Automatically pauses the timer after 30 minutes of inactivity and prompts you to resume.
- **Per-workspace tracking**: Tracks time separately for each workspace, allowing you to see how much time you've spent on different projects.
- **Session history**: Keeps a detailed history of all your coding sessions with timestamps and durations.
- **Status bar integration**: Displays the current project name and elapsed time directly in the VS Code status bar.
- **Sidebar panel**: Dedicated sidebar view showing:
  - Current session timer
  - Total time spent on the project
  - Complete session history
- **Persistent storage**: All data is saved automatically and survives VS Code restarts.

## Technologies Used

- TypeScript
- Visual Studio Code Extension API
- VSCE (Visual Studio Code Extension packaging tool)

## Getting Started

To get started with CodeClock, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/YourUsername/CodeClock.git
   ```

2. Navigate to the project folder:

   ```bash
   cd CodeClock
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Press `F5` to open debug extension

## Build

For build extension follow this steps:

1. Build the extension:

   ```bash
   vsce package
   ```

2. Install the extension in Visual Studio Code using the **"Install from VSIX"** option.

## Usage

Once CodeClock is installed:

1. Open Visual Studio Code with a workspace folder.
2. CodeClock will automatically start tracking your time.
3. View your time in two ways:
   - **Status bar**: Shows project name and current session time (e.g., "MyProject — 1h 23m")
   - **Sidebar**: Click the CodeClock icon or the status bar to open the detailed view
4. The timer automatically pauses after 30 minutes of inactivity and prompts you to resume.
5. Use commands:
   - `CodeClock: Start Timer` — manually start the timer
   - `CodeClock: Stop Timer` — manually stop the timer
   - `CodeClock: Clear Data` — clear all tracking data for the current workspace

All your coding session data is saved automatically and will be preserved between VS Code sessions.

## License & Community Guidelines

- [License](LICENSE) — project license.
- [Code of Conduct](CODE_OF_CONDUCT.md) — expected behavior for contributors.
- [Contributing Guide](CONTRIBUTING.md) — how to help the project.
- [Security Policy](SECURITY.md) — reporting security issues.

---

## CodeClock :ukraine:

<p align='center'>
  <img src='assets/icon.png' alt='Extension Icon' style="width:50%">
</p>

## Огляд

CodeClock — це розширення для відстеження часу в Visual Studio Code, яке автоматично відстежує час, який ви витрачаєте на кодування в кожному робочому просторі. Воно моніторить вашу активність, призупиняється під час простою та надає детальну статистику про ваші сесії кодування.

## Особливості

- **Автоматичне відстеження часу**: CodeClock автоматично починає відстеження, коли ви відкриваєте робочий простір, і зупиняється, коли ви його закриваєте.
- **Виявлення простою**: Автоматично призупиняє таймер після 30 хвилин неактивності та пропонує вам продовжити.
- **Відстеження для кожного робочого простору**: Відстежує час окремо для кожного робочого простору, дозволяючи бачити, скільки часу ви витратили на різні проєкти.
- **Історія сесій**: Зберігає детальну історію всіх ваших сесій кодування з мітками часу та тривалістю.
- **Інтеграція зі статус-баром**: Відображає назву поточного проєкту та час безпосередньо в статус-барі VS Code.
- **Бокова панель**: Окремий вигляд бокової панелі, що показує:
  - Таймер поточної сесії
  - Загальний час, витрачений на проєкт
  - Повну історію сесій
- **Постійне зберігання**: Всі дані зберігаються автоматично та залишаються після перезапуску VS Code.

## Використані технології

- TypeScript
- Visual Studio Code Extension API
- VSCE (інструмент для пакування розширень Visual Studio Code)

## Початок роботи

Щоб розпочати роботу з CodeClock, виконайте наступні кроки:

1. Клонуйте репозиторій:

   ```bash
   git clone https://github.com/YourUsername/CodeClock.git
   ```

2. Перейдіть до папки проекту:

   ```bash
   cd CodeClock
   ```

3. Встановіть залежності:

   ```bash
   npm install
   ```

4. Натисніть `F5` щоб відкрити debug розширення

## Збірка

Щоб зібрати розширення слідуйте наступним крокам:

1. Зберіть розширення:

   ```bash
   vsce package
   ```

2. Встановіть розширення у Visual Studio Code за допомогою опції **"Install from VSIX"**.

## Використання

Після встановлення CodeClock:

1. Відкрийте Visual Studio Code з папкою робочого простору.
2. CodeClock автоматично почне відстежувати ваш час.
3. Переглядайте свій час двома способами:
   - **Статус-бар**: Показує назву проєкту та час поточної сесії (наприклад, "MyProject — 1h 23m")
   - **Бокова панель**: Клацніть на іконку CodeClock або статус-бар, щоб відкрити детальний вигляд
4. Таймер автоматично призупиняється після 30 хвилин неактивності та пропонує вам продовжити.
5. Використовуйте команди:
   - `CodeClock: Start Timer` — вручну запустити таймер
   - `CodeClock: Stop Timer` — вручну зупинити таймер
   - `CodeClock: Clear Data` — очистити всі дані відстеження для поточного робочого простору

Всі дані ваших сесій кодування зберігаються автоматично та будуть збережені між сесіями VS Code.

## Ліцензія та правила спільноти

- [Ліцензія](LICENSE) — ліцензія проекту.
- [Кодекс поведінки](CODE_OF_CONDUCT.md) — очікувана поведінка для учасників.
- [Посібник для внеску](CONTRIBUTING.md) — як допомогти проекту.
- [Політика безпеки](SECURITY.md) — повідомлення про проблеми безпеки.
