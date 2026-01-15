# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-01-14

### Added

- **Offline License System**: Cryptographic license verification using Ed25519 signatures.
  - Machine ID binding for license keys.
  - Time-based expiry with anti-clock-rollback protection.
  - Activation paywall for unlicensed installations.
- **Device Info Menu**: New "Device Info..." menu item showing Machine ID, OS, CPU, and license status.
- **License Generator Tool**: Standalone HTML tool (`tools/license-generator.html`) for generating license keys.

### Changed

- App version bumped to 1.2.0.

---

## [1.1.0] - 2026-01-14

### Added

- **Cross-Platform Desktop App**: Converted the web application to a desktop app using Electron.
- **Setup Wizard**: Automated the initial configuration process. Detected missing settings or users and redirects to `/setup`.
- **System Console**: Added a real-time log viewer and network address display in _Settings > General_.
- **Native Menus**: Added a native application menu with shortcuts for:
  - **Tickets**: Quick access to the internal support dashboard.
  - **Help**: Direct WhatsApp contact link for developer support.
  - **System Settings**: Quick access to configuration.
- **Configurable Port**: The application port can now be customized via `config.json` (Defaults to 2304).

### Changed

- **Server Mode**: The embedded Next.js server now runs in **production mode** by default for improved performance.
- **Database Logic**: Enhanced `db:wipe` script to handle foreign key constraints safely.
- **Security**: Implemented bytecode compilation (`bytenode`) and client-side code obfuscation.

### Fixed

- **API Compatibility**: Resolved Next.js 15/16 parameter handling issues in API routes.
- **Image Handling**: Fixed image display issues in Electron by using `unoptimized` tags and proper path routing.
