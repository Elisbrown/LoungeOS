/**
 * LoungeOS License Verification Module
 *
 * Security Features:
 * - Ed25519 signature verification
 * - Machine ID binding
 * - Expiry date check
 * - Anti-clock-rollback protection
 */

const nacl = require("tweetnacl");
const naclUtil = require("tweetnacl-util");
const { machineIdSync } = require("node-machine-id");
const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const log = require("electron-log");

// ============================================
// EMBEDDED PUBLIC KEY (from your private key)
// ============================================
const PUBLIC_KEY_BASE64 = "AGm1kwd8HWFMe1He/O/SRqcw6M1ZEHwbF5WlmRSUqWE=";
const PUBLIC_KEY = naclUtil.decodeBase64(PUBLIC_KEY_BASE64);

// ============================================
// FILE PATHS
// ============================================
function getLicensePath() {
  return path.join(app.getPath("userData"), "license.key");
}

function getTimestampPath() {
  return path.join(app.getPath("userData"), ".last_run");
}

// ============================================
// MACHINE ID
// ============================================
function getMachineId() {
  try {
    return machineIdSync({ original: true });
  } catch (error) {
    log.error("Failed to get machine ID:", error);
    return null;
  }
}

// ============================================
// ANTI-CLOCK-ROLLBACK
// ============================================
function getLastRunTimestamp() {
  try {
    const timestampPath = getTimestampPath();
    if (fs.existsSync(timestampPath)) {
      const data = fs.readFileSync(timestampPath, "utf8");
      return parseInt(data, 10);
    }
  } catch (error) {
    log.error("Failed to read last run timestamp:", error);
  }
  return 0;
}

function saveCurrentTimestamp() {
  try {
    const timestampPath = getTimestampPath();
    fs.writeFileSync(timestampPath, Date.now().toString());
  } catch (error) {
    log.error("Failed to save timestamp:", error);
  }
}

function isClockRolledBack() {
  const lastRun = getLastRunTimestamp();
  const now = Date.now();

  // If current time is more than 1 hour before last run, suspect tampering
  // Allow some tolerance for minor clock drift
  const ONE_HOUR = 60 * 60 * 1000;
  if (lastRun > 0 && now < lastRun - ONE_HOUR) {
    log.warn("Clock rollback detected!");
    return true;
  }
  return false;
}

// ============================================
// LICENSE VERIFICATION
// ============================================
function readLicenseFile() {
  try {
    const licensePath = getLicensePath();
    if (!fs.existsSync(licensePath)) {
      return null;
    }
    const licenseKey = fs.readFileSync(licensePath, "utf8").trim();
    return licenseKey;
  } catch (error) {
    log.error("Failed to read license file:", error);
    return null;
  }
}

function parseLicense(licenseKey) {
  try {
    // Decode Base64
    const decoded = Buffer.from(licenseKey, "base64").toString("utf8");
    const licenseData = JSON.parse(decoded);

    if (!licenseData.payload || !licenseData.signature) {
      return { valid: false, error: "Invalid license format" };
    }

    return { valid: true, data: licenseData };
  } catch (error) {
    return { valid: false, error: "Failed to parse license: " + error.message };
  }
}

function verifySignature(payload, signatureBase64) {
  try {
    const payloadString = JSON.stringify(payload);
    const payloadBytes = naclUtil.decodeUTF8(payloadString);
    const signatureBytes = naclUtil.decodeBase64(signatureBase64);

    const isValid = nacl.sign.detached.verify(
      payloadBytes,
      signatureBytes,
      PUBLIC_KEY
    );
    return isValid;
  } catch (error) {
    log.error("Signature verification error:", error);
    return false;
  }
}

function verifyLicense() {
  const result = {
    valid: false,
    error: null,
    info: null,
  };

  // Check for clock rollback first
  if (isClockRolledBack()) {
    result.error =
      "System clock tampering detected. Please correct your system time.";
    return result;
  }

  // Read license file
  const licenseKey = readLicenseFile();
  if (!licenseKey) {
    result.error = "No license found. Please activate the software.";
    return result;
  }

  // Parse license
  const parsed = parseLicense(licenseKey);
  if (!parsed.valid) {
    result.error = parsed.error;
    return result;
  }

  const { payload, signature } = parsed.data;

  // Verify cryptographic signature
  if (!verifySignature(payload, signature)) {
    result.error =
      "Invalid license signature. The license key may be corrupted or tampered with.";
    return result;
  }

  // Verify machine ID
  const currentMachineId = getMachineId();
  if (!currentMachineId) {
    result.error = "Could not determine machine ID.";
    return result;
  }

  if (payload.machineId !== currentMachineId) {
    result.error = "License is not valid for this machine.";
    return result;
  }

  // Verify expiry
  const now = new Date();
  const expiresAt = new Date(payload.expiresAt);

  if (now > expiresAt) {
    result.error = `License expired on ${expiresAt.toLocaleDateString()}. Please renew.`;
    return result;
  }

  // All checks passed
  saveCurrentTimestamp();

  result.valid = true;
  result.info = {
    type: payload.type,
    licensee: payload.licensee,
    expiresAt: payload.expiresAt,
    issuedAt: payload.issuedAt,
    daysRemaining: Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)),
  };

  return result;
}

// ============================================
// LICENSE ACTIVATION
// ============================================
function activateLicense(licenseKey) {
  try {
    // Clean up the key (remove whitespace/newlines)
    const cleanKey = licenseKey.replace(/\s/g, "");

    // Parse and validate before saving
    const parsed = parseLicense(cleanKey);
    if (!parsed.valid) {
      return { success: false, error: parsed.error };
    }

    const { payload, signature } = parsed.data;

    // Verify signature
    if (!verifySignature(payload, signature)) {
      return { success: false, error: "Invalid license key." };
    }

    // Verify machine ID
    const currentMachineId = getMachineId();
    if (payload.machineId !== currentMachineId) {
      return {
        success: false,
        error: "This license is not valid for this machine.",
      };
    }

    // Verify not expired
    const now = new Date();
    const expiresAt = new Date(payload.expiresAt);
    if (now > expiresAt) {
      return { success: false, error: "This license has already expired." };
    }

    // Save the license
    const licensePath = getLicensePath();
    fs.writeFileSync(licensePath, cleanKey);

    // Save timestamp for anti-rollback
    saveCurrentTimestamp();

    log.info(
      `License activated for ${payload.licensee}, expires ${payload.expiresAt}`
    );

    return {
      success: true,
      info: {
        type: payload.type,
        licensee: payload.licensee,
        expiresAt: payload.expiresAt,
      },
    };
  } catch (error) {
    log.error("License activation error:", error);
    return { success: false, error: "Activation failed: " + error.message };
  }
}

// ============================================
// LICENSE DEACTIVATION
// ============================================
function deactivateLicense() {
  try {
    const licensePath = getLicensePath();
    if (fs.existsSync(licensePath)) {
      fs.unlinkSync(licensePath);
      log.info("License deactivated successfully");
      return { success: true };
    }
    return { success: false, error: "No license found to deactivate" };
  } catch (error) {
    log.error("License deactivation error:", error);
    return { success: false, error: "Deactivation failed: " + error.message };
  }
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
  getMachineId,
  verifyLicense,
  activateLicense,
  deactivateLicense,
  getLicenseInfo: () => {
    const result = verifyLicense();
    return result.valid ? result.info : null;
  },
};
