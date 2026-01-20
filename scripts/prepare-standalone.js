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

// First: Rebuild better-sqlite3 for Electron (not system Node.js)
console.log('Rebuilding better-sqlite3 for Electron...');
const { execSync } = require('child_process');

try {
    // Get Electron version
    const electronPkg = require('electron/package.json');
    const electronVersion = electronPkg.version;
    console.log(`  Electron version: ${electronVersion}`);

    // Use @electron/rebuild to compile for correct Electron version
    execSync(`npx @electron/rebuild -v ${electronVersion} -m ${projectRoot} -o better-sqlite3`, {
        cwd: projectRoot,
        stdio: 'inherit'
    });
    console.log('  ✓ better-sqlite3 rebuilt for Electron');
} catch (error) {
    console.error('Failed to rebuild for Electron:', error.message);
    // Continue anyway - the binary might already be correct
}

// Fix: Replace ALL better_sqlite3.node binaries in standalone with the Electron-rebuilt version
// Next.js bundles native modules with hashed paths like: .next/node_modules/better-sqlite3-HASH/build/Release/better_sqlite3.node
// We need to find those and replace them with the correctly compiled version

const electronRebuildNodeFile = path.join(projectRoot, 'node_modules', 'better-sqlite3', 'build', 'Release', 'better_sqlite3.node');

if (!fs.existsSync(electronRebuildNodeFile)) {
    console.warn(`Warning: Electron-rebuilt better_sqlite3.node not found at ${electronRebuildNodeFile}`);
    console.warn('Run "npm rebuild better-sqlite3" first');
    process.exit(1);
}

console.log(`Found Electron-rebuilt native module: ${electronRebuildNodeFile}`);

// Recursively find all better_sqlite3.node files in .next/standalone
function findFiles(dir, filename, results = []) {
    if (!fs.existsSync(dir)) return results;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            findFiles(fullPath, filename, results);
        } else if (entry.name === filename) {
            results.push(fullPath);
        }
    }
    return results;
}

// Also need to scan the main .next directory (Turbopack creates .next/node_modules too!)
const nextDir = path.join(projectRoot, '.next');
const targetFiles = [
    ...findFiles(standaloneDir, 'better_sqlite3.node'),
    ...findFiles(nextDir, 'better_sqlite3.node')
        // Filter out standalone to avoid duplicates
        .filter(f => !f.includes('standalone'))
];
// Deduplicate paths
const uniqueTargets = [...new Set(targetFiles)];
console.log(`Found ${uniqueTargets.length} native module(s) to replace:`);

for (const targetFile of uniqueTargets) {
    console.log(`  Replacing: ${targetFile}`);
    try {
        fs.copyFileSync(electronRebuildNodeFile, targetFile);
        console.log(`  ✓ Replaced successfully`);
    } catch (err) {
        console.error(`  ✗ Failed to replace: ${err.message}`);
        process.exit(1);
    }
}

if (uniqueTargets.length === 0) {
    // Fallback: copy to standard location
    const standardPath = path.join(standaloneDir, 'node_modules', 'better-sqlite3', 'build', 'Release');
    if (!fs.existsSync(standardPath)) {
        fs.mkdirSync(standardPath, { recursive: true });
    }
    const destFile = path.join(standardPath, 'better_sqlite3.node');
    console.log(`No existing .node files found. Copying to standard path: ${destFile}`);
    fs.copyFileSync(electronRebuildNodeFile, destFile);
}

console.log('Native module replacement complete.');
