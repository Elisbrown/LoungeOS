# Native Windows Build Guide

This guide explains how to build LoungeOS directly on a Windows 10/11 machine without using Docker.

## Prerequisites

Before starting, ensure you have the following installed on your Windows machine:

1.  **Node.js (v20 or newer)**:
    - Download from [nodejs.org](https://nodejs.org/) (LTS version recommended).
2.  **Git**:
    - Download from [git-scm.com](https://git-scm.com/).
3.  **Visual Studio Build Tools** (Required for `better-sqlite3`):
    - Download the [Visual Studio Installer](https://visualstudio.microsoft.com/downloads/).
    - During installation, select the **"Desktop development with C++"** workload.
    - Ensure "MSVC v143 - VS 2022 C++ x64/x86 build tools" and "Windows 11 SDK" are checked.
4.  **Python 3.10+**:
    - Usually installed via the Visual Studio Build Tools or from [python.org](https://www.python.org/).

## Build Steps

Once your environment is set up, follow these steps in your terminal (PowerShell or Command Prompt):

1.  **Install Dependencies**:

    ```powershell
    npm install
    ```

    > [!IMPORTANT]
    > If `better-sqlite3` fails to install, ensure you have the Visual Studio Build Tools mentioned above.

2.  **Run the Build Script**:
    We have added a specific script for native Windows builds:

    ```powershell
    npm run electron:build:win:native
    ```

    This script automatically performs the following:

    - `next build`: Compiles the Next.js application.
    - `node scripts/obfuscate.js`: Obfuscates the javascript files.
    - `npx bytenode --compile electron/main.js`: Compiles the main process to bytecode for security.
    - `npx electron-builder --win`: Packages everything into a `.exe` installer.

3.  **Find your Installer**:
    The generated setup file will be located in the `dist/` folder:
    - `dist/LoungeOS Setup 1.2.0.exe`

## Troubleshooting

### "Cannot find module 'bytenode'"

We have moved `bytenode` to the main dependencies in `package.json`. If you still see this error, ensure you have run `npm install` again to update your `node_modules`.

### "dlopen failed" or "sqlite3 error"

This usually happens when the native modules were built for a different architecture or OS. Running `npm install` on the Windows machine should resolve this by rebuilding the modules locally for Windows.
