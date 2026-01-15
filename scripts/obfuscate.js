const JavaScriptObfuscator = require("javascript-obfuscator");
const fs = require("fs");
const path = require("path");
const { globSync } = require("glob");

const nextDir = path.join(__dirname, "..", ".next");

console.log("Starting obfuscation of .next directory...");

// Glob for all JS files in .next/static
const files = globSync("**/*.js", {
  cwd: nextDir,
  absolute: true,
  ignore: ["**/node_modules/**"],
});

console.log(`Found ${files.length} JS files to obfuscate.`);

files.forEach((file) => {
  try {
    const code = fs.readFileSync(file, "utf8");
    const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: false,
      selfDefending: false,
      stringArray: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayThreshold: 0.75,
      transformObjectKeys: true,
      unicodeEscapeSequence: false,
    });

    fs.writeFileSync(file, obfuscationResult.getObfuscatedCode());
    // Use console.log instead of template literal to avoid issues if any
    console.log("Obfuscated: " + path.relative(nextDir, file));
  } catch (e) {
    console.warn("Failed to obfuscate " + file + ": " + e.message);
  }
});

console.log("Obfuscation complete.");
