---
description: How to build the Electron app for Mac and Windows
---

## Prerequisites

- Node.js 18+
- Docker Desktop (for Windows builds)
- Optional: Apple Developer ID certificate (for code signing)

## Build for Mac (Universal - arm64 + x64)

// turbo

1. Run `npm run electron:build:mac`
2. Output in `dist/` folder: `LoungeOS-{version}-universal.dmg`

## Build for Windows (via Docker)

// turbo

1. Ensure Docker Desktop is running
2. Run `npm run electron:build:win`
3. Output in `dist/`: `LoungeOS Setup {version}.exe`

## Build Both Platforms

// turbo

1. Run `npm run electron:build:all`

## Bypassing Gatekeeper (Without Code Signing)

If the Mac app shows "contact developer":

```bash
# Remove quarantine attribute
xattr -cr /Applications/LoungeOS.app
```

Or: Right-click → Open → Open (first launch only)

## Troubleshooting

### cachedDataRejected Error on Windows

- Cause: Bytecode compiled on Mac cannot run on Windows
- Fix: Always use `npm run electron:build:win` (Docker builds bytecode for Windows)

### macOS "Contact Developer" Warning

- Cause: App not code-signed or notarized
- Fix: Use Apple Developer ID certificate, or users bypass with `xattr -cr`

### Docker Build Fails

1. Ensure Docker Desktop is running
2. Check you have internet access (Docker needs to pull images)
3. Try `docker pull electronuserland/builder:wine` first
