const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const standaloneDir = path.join(projectRoot, '.next', 'standalone');
const staticSrc = path.join(projectRoot, '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
const publicSrc = path.join(projectRoot, 'public');
const publicDest = path.join(standaloneDir, 'public');

console.log('Preparing standalone build...');

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;

    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Copy .next/static
if (fs.existsSync(staticSrc)) {
    console.log(`Copying static assets: ${staticSrc} -> ${staticDest}`);
    copyDir(staticSrc, staticDest);
} else {
    console.warn(`Warning: Static assets not found at ${staticSrc}`);
}

// Copy public
if (fs.existsSync(publicSrc)) {
    console.log(`Copying public assets: ${publicSrc} -> ${publicDest}`);
    copyDir(publicSrc, publicDest);
} else {
    console.warn(`Warning: Public assets not found at ${publicSrc}`);
}

console.log('Standalone build preparation complete.');

// Fix: Copy the Electron-rebuilt better-sqlite3 from root node_modules
// to the standalone node_modules, replacing the incompatible version.
const betterSqliteSrc = path.join(projectRoot, 'node_modules', 'better-sqlite3');
const standaloneNodeModules = path.join(standaloneDir, 'node_modules');

// Helper to find deep node_modules in standalone (Next.js 13+ bundles deps inside .next/server/...)
// But for native modules, we might need to manually ensure the right .node file is present.
// The error log shows: .next\node_modules\better-sqlite3-...\build\Release\better_sqlite3.node
// This suggests Next.js bundled it uniquely.
// simpler approach: The standalone build respects the ordinary node_modules structure if present.
// We will copy the rebuilt module to the standalone root node_modules to ensure it's available.

if (fs.existsSync(betterSqliteSrc)) {
    const betterSqliteDest = path.join(standaloneNodeModules, 'better-sqlite3');
    console.log(`Copying compatible better-sqlite3: ${betterSqliteSrc} -> ${betterSqliteDest}`);
    copyDir(betterSqliteSrc, betterSqliteDest);
} else {
    console.warn(`Warning: better-sqlite3 not found at ${betterSqliteSrc}`);
}

// Rebuild native modules inside the standalone directory for Electron
// Rebuild native modules inside the standalone directory for Electron
console.log('Rebuilding native modules for Electron...');
try {
    const { execSync } = require('child_process');

    // Get installed Electron version
    const electronPkg = require('electron/package.json');
    const electronVersion = electronPkg.version;
    console.log(`Detected Electron version: ${electronVersion}`);

    // We need to run inside .next/standalone
    // We explicitly set npm_config_target to ensuring it builds for this Electron version
    execSync('npx electron-builder install-app-deps', {
        cwd: standaloneDir,
        stdio: 'inherit',
        env: {
            ...process.env,
            npm_config_target: electronVersion,
            npm_config_runtime: 'electron',
            npm_config_disturl: 'https://electronjs.org/headers',
            ELECTRON_VERSION: electronVersion
        }
    });
    console.log('Native modules rebuilt successfully.');
} catch (error) {
    console.error('Failed to rebuild native modules:', error);
    process.exit(1);
}
