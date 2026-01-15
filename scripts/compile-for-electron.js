/**
 * Compile main.js to bytecode using Electron's Node.js runtime.
 * This ensures the bytecode is compatible with the Electron version.
 */
const { execSync } = require('child_process');
const path = require('path');

const electronPath = require('electron');
const bytenodePath = require.resolve('bytenode/lib/cli.js');
const mainJsPath = path.join(__dirname, '..', 'electron', 'main.js');

console.log('Compiling main.js to bytecode using Electron runtime...');
console.log(`  Electron: ${electronPath}`);
console.log(`  Bytenode: ${bytenodePath}`);
console.log(`  Target:   ${mainJsPath}`);

try {
    execSync(`"${electronPath}" "${bytenodePath}" --compile "${mainJsPath}"`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
    });
    console.log('Bytecode compilation complete!');
} catch (error) {
    console.error('Failed to compile bytecode:', error.message);
    process.exit(1);
}
