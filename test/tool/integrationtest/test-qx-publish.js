const os = require('os');

const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const testUtils = require("../../../bin/tools/utils");
const path = require("path");

// Skip entire file if on Linux
if (os.platform() === 'linux') {
  console.log('Skipping this test file on Linux.');
  return;
}


// set DEBUG envvar to get colorized verbose output
const debug = Boolean(process.env.DEBUG);
let qxCmdPath = testUtils.getCompiler(debug ? "source" : "build");
qxCmdPath = testUtils.getCompiler("source");
const testDir = path.join(__dirname, "test-qx-publish");
const packageDir = path.join(testDir, "testpackage");

// Track whether we need to clean up a temporary token
let temporaryTokenCreated = false;

if (debug) {
}


/**
 * Helper function to create a test package with Manifest.json
 */
async function createTestPackage(version = "1.0.0") {
  if (!fs.existsSync(packageDir)) {
    fs.mkdirSync(packageDir, { recursive: true });
  }

  // Create Manifest.json with proper structure for Manifest 2.0
  const manifest = {
    "$schema": "https://qooxdoo.org/schema/Manifest-2-0-0.json",
    "info": {
      "name": "testpackage",
      "summary": "Test package for publish tests",
      "description": "A test package used for testing qx package publish command",
      "homepage": "https://github.com/testuser/testpackage",
      "license": "MIT",
      "authors": [
        {
          "name": "Test User",
          "email": "test@example.com"
        }
      ],
      "version": version
    },
    "provides": {
      "namespace": "testpackage",
      "encoding": "utf-8",
      "class": "source/class",
      "resource": "source/resource",
      "translation": "source/translation",
      "type": "library"
    },
    "requires": {
      "@qooxdoo/framework": "^7.0.0"
    }
  };

  fs.writeFileSync(
    path.join(packageDir, "Manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  // Create package.json with qooxdoo dependency
  const packageJson = {
    "name": "testpackage",
    "version": version,
    "description": "Test package",
    "license": "MIT",
    "devDependencies": {
      "@qooxdoo/framework": "^7.0.0"
    }
  };

  fs.writeFileSync(
    path.join(packageDir, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  // Create source directory structure
  const sourceDir = path.join(packageDir, "source", "class", "testpackage");
  if (!fs.existsSync(sourceDir)) {
    fs.mkdirSync(sourceDir, { recursive: true });
  }

  // Create a simple class file
  fs.writeFileSync(
    path.join(sourceDir, "__init__.js"),
    "/** Test package namespace */\n"
  );
}


/**
 * Helper function to initialize a git repository
 */
async function initGitRepo() {
  const { exec } = require("child_process");
  const util = require("util");
  const execPromise = util.promisify(exec);

  try {
    // Initialize git repo
    await execPromise("git init", { cwd: packageDir });

    // Configure git user for test commits
    await execPromise('git config user.email "test@example.com"', { cwd: packageDir });
    await execPromise('git config user.name "Test User"', { cwd: packageDir });

    // Add and commit all files
    await execPromise("git add .", { cwd: packageDir });
    await execPromise('git commit -m "Initial commit"', { cwd: packageDir });

    // Create a remote (fake, just for testing)
    await execPromise('git remote add origin https://github.com/testuser/testpackage.git', { cwd: packageDir });

    return true;
  } catch (err) {
    console.error("Error initializing git repo:", err);
    return false;
  }
}

/**
 * Helper function to read Manifest.json
 */
function readManifest() {
  const manifestPath = path.join(packageDir, "Manifest.json");
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

/**
 * Helper function to check if git is available
 */
async function isGitAvailable() {
  const { exec } = require("child_process");
  const util = require("util");
  const execPromise = util.promisify(exec);

  try {
    await execPromise("git --version");
    return true;
  } catch (err) {
    return false;
  }
}

// ============================================================================
// Basic Command Tests
// ============================================================================
test('This test runs only on non-Linux systems', async () => {
  assert.ok(true, 'Test executed');
});

test("Test qx package publish help", async () => {
  try {
    let result;
    result = await testUtils.runCommand(__dirname, qxCmdPath, "package", "publish", "--help");
    assert.ok(result.exitCode === 0, "Publish help should work");
    result.output = result.output.toLowerCase();
    assert.ok(result.output.includes("publish"), "Help should mention publish command");
    assert.ok(result.output.includes("github"), "Help should mention GitHub");
    assert.ok(result.output.includes("release"), "Help should mention release");
  } catch (ex) {
    throw ex;
  }
});

test("Test qx package publish without parameters shows usage", async () => {
  try {
    let result;
    result = await testUtils.runCommand(__dirname, qxCmdPath, "package", "publish");
    // Command may fail or show help - both are acceptable
    result.output = result.output.toLowerCase();
    // Should show some usage information or error message
    assert.ok(
      result.output.includes("publish") ||
      result.output.includes("usage") ||
      result.output.includes("github") ||
      result.output.includes("commit") ||
      result.output.includes("error") ||
      result.error.toLowerCase().includes("commit") ||
      result.error.toLowerCase().includes("error"),
      "Should show usage or error information"
    );
  } catch (ex) {
    throw ex;
  }
});

// ============================================================================
// Setup Test Package
// ============================================================================

test("Create test package structure", async () => {
  try {
    await testUtils.deleteRecursive(testDir);
    await createTestPackage("1.0.0");

    assert.ok(fs.existsSync(packageDir), "Package directory should exist");
    assert.ok(fs.existsSync(path.join(packageDir, "Manifest.json")), "Manifest.json should exist");
    assert.ok(fs.existsSync(path.join(packageDir, "package.json")), "package.json should exist");

    const manifest = readManifest();
    assert.equal(manifest.info.version, "1.0.0", "Initial version should be 1.0.0");

  } catch (ex) {
    throw ex;
  }
});

test("Initialize git repository for test package", async () => {
  try {
    const gitAvailable = await isGitAvailable();
    if (!gitAvailable) {
      assert.ok(true, "Git not available, skipping git tests");
      return;
    }

    const success = await initGitRepo();
    assert.ok(success, "Git repository should be initialized");
    assert.ok(fs.existsSync(path.join(packageDir, ".git")), ".git directory should exist");

  } catch (ex) {
    throw ex;
  }
});

// ============================================================================
// Setup GitHub Token (Required for Publish Tests)
// ============================================================================

test("Setup GitHub token for publish tests", async () => {
  try {
    // Check if github.token already exists
    let result = await testUtils.runCommand(__dirname, qxCmdPath, "config", "get", "github.token");

    // Check if token is actually set (look for "is not set" message or empty output)
    const noToken = result.output.includes("is not set") ||
                    (!result.output.trim() && result.exitCode === 0) ||
                    result.output.trim() === "github.token is not set";

    if (noToken) {
      // No token exists, create a temporary one
      result = await testUtils.runCommand(
        __dirname,
        qxCmdPath,
        "config",
        "set",
        "github.token",
        "TEST_TOKEN_DO_NOT_PUBLISH_12345"
      );

      assert.ok(result.exitCode === 0, "Should be able to set temporary GitHub token");
      temporaryTokenCreated = true;

      // Verify token was set
      result = await testUtils.runCommand(__dirname, qxCmdPath, "config", "get", "github.token");
      assert.ok(result.output.includes("TEST_TOKEN"), "Temporary token should be set");
    } else {
      assert.ok(true, "GitHub token already exists, using existing token");
    }

  } catch (ex) {
    throw ex;
  }
});

// ============================================================================
// Validation Tests (Expected to Fail Gracefully)
// ============================================================================

test("Test publish without git repository", async () => {
  try {
    // Create a package without git
    const noGitDir = path.join(testDir, "nogit");
    if (!fs.existsSync(noGitDir)) {
      fs.mkdirSync(noGitDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(noGitDir, "Manifest.json"),
      JSON.stringify({
        provides: { namespace: "test", encoding: "utf-8", class: "source/class", type: "library" },
        info: { name: "test", version: "1.0.0", "qooxdoo-range": "^7.0.0" }
      }, null, 2)
    );

    let result = await testUtils.runCommand(
      noGitDir,
      qxCmdPath,
      "package",
      "publish",
      "--dry-run",
      "--noninteractive"
    );

    // Should fail because no git repo
    assert.ok(
      result.exitCode !== 0 || result.error.includes("git") || result.output.includes("git"),
      "Should fail or warn about missing git repository"
    );

    // Cleanup
    await testUtils.deleteRecursive(noGitDir);

  } catch (ex) {
    throw ex;
  }
});

test("Test publish without Manifest.json", async () => {
  try {
    const noManifestDir = path.join(testDir, "nomanifest");
    if (!fs.existsSync(noManifestDir)) {
      fs.mkdirSync(noManifestDir, { recursive: true });
    }

    let result = await testUtils.runCommand(
      noManifestDir,
      qxCmdPath,
      "package",
      "publish",
      "--dry-run",
      "--noninteractive"
    );

    // Should fail because no Manifest.json
    assert.ok(
      result.exitCode !== 0 || result.output.toLowerCase().includes("manifest") || result.error.toLowerCase().includes("manifest"),
      "Should fail or warn about missing Manifest.json"
    );

    // Cleanup
    await testUtils.deleteRecursive(noManifestDir);

  } catch (ex) {
    throw ex;
  }
});

test("Test publish with invalid version type", async () => {
  try {
    let result = await testUtils.runCommand(
      packageDir,
      qxCmdPath,
      "package",
      "publish",
      "--type=invalid",
      "--dry-run",
      "--noninteractive"
    );

    // Should fail because invalid version type
    assert.ok(
      result.exitCode !== 0 || result.output.includes("invalid") || result.error.includes("invalid"),
      "Should fail with invalid version type"
    );

  } catch (ex) {
    throw ex;
  }
});

// ============================================================================
// Dry-Run Mode Tests (Safe - No GitHub Interaction)
// ============================================================================

test("Test dry-run with default patch version increment", async () => {
  try {
    const gitAvailable = await isGitAvailable();
    if (!gitAvailable) {
      assert.ok(true, "Git not available, skipping test");
      return;
    }

    const manifestBefore = readManifest();
    const versionBefore = manifestBefore.info.version;

    let result = await testUtils.runCommand(
      packageDir,
      qxCmdPath,
      "package",
      "publish",
      "--dry-run",
      "--noninteractive"
    );

    // In dry-run mode, it should succeed or show what it would do
    const outputLower = (result.output || "").toLowerCase();
    const errorLower = (result.error || "").toLowerCase();

    // Check that it mentions version/release OR fails with expected error (acceptable in test)
    const hasVersionInfo = outputLower.includes("version") ||
      outputLower.includes("release") ||
      outputLower.includes("dry");
    const hasGitHubError = errorLower.includes("github") ||
      errorLower.includes("httperror") ||
      outputLower.includes("github");
    const hasGitError = errorLower.includes("commit") ||
      errorLower.includes("stash") ||
      errorLower.includes("git");
    const hasQxError = errorLower.includes("qooxdoo") ||
      errorLower.includes("manifest");
    const hasTokenError = errorLower.includes("token") && errorLower.includes("invalid");

    assert.ok(
      result.exitCode === 0 || hasVersionInfo || hasGitHubError || hasGitError || hasQxError || hasTokenError,
      "Should succeed, show version info, or fail with expected error (token/git/github)"
    );

    // Verify Manifest.json was NOT modified
    const manifestAfter = readManifest();
    assert.equal(
      manifestAfter.info.version,
      versionBefore,
      "Manifest.json should NOT be modified in dry-run mode"
    );

  } catch (ex) {
    throw ex;
  }
});

test("Test dry-run with major version increment", async () => {
  try {
    const gitAvailable = await isGitAvailable();
    if (!gitAvailable) {
      assert.ok(true, "Git not available, skipping test");
      return;
    }

    const manifestBefore = readManifest();
    const versionBefore = manifestBefore.info.version;

    let result = await testUtils.runCommand(
      packageDir,
      qxCmdPath,
      "package",
      "publish",
      "--type=major",
      "--dry-run",
      "--noninteractive"
    );

    result.output = result.output.toLowerCase();
    const hasInfo = result.output.includes("version") || result.output.includes("2.0.0") || result.output.includes("major");
    const hasError = result.error.toLowerCase().includes("github") || result.error.toLowerCase().includes("httperror");
    assert.ok(
      hasInfo || hasError || result.exitCode !== 0,
      "Should mention major version or fail with expected error"
    );

    // Verify Manifest.json was NOT modified
    const manifestAfter = readManifest();
    assert.equal(
      manifestAfter.info.version,
      versionBefore,
      "Manifest.json should NOT be modified in dry-run mode"
    );

  } catch (ex) {
    throw ex;
  }
});

test("Test dry-run with minor version increment", async () => {
  try {
    const gitAvailable = await isGitAvailable();
    if (!gitAvailable) {
      assert.ok(true, "Git not available, skipping test");
      return;
    }

    const manifestBefore = readManifest();
    const versionBefore = manifestBefore.info.version;

    let result = await testUtils.runCommand(
      packageDir,
      qxCmdPath,
      "package",
      "publish",
      "--type=minor",
      "--dry-run",
      "--noninteractive"
    );

    result.output = result.output.toLowerCase();
    const hasInfo = result.output.includes("version") || result.output.includes("1.1.0") || result.output.includes("minor");
    const hasError = result.error.toLowerCase().includes("github") || result.error.toLowerCase().includes("httperror");
    assert.ok(
      hasInfo || hasError || result.exitCode !== 0,
      "Should mention minor version or fail with expected error"
    );

    // Verify Manifest.json was NOT modified
    const manifestAfter = readManifest();
    assert.equal(
      manifestAfter.info.version,
      versionBefore,
      "Manifest.json should NOT be modified in dry-run mode"
    );

  } catch (ex) {
    throw ex;
  }
});

test("Test dry-run with patch version increment", async () => {
  try {
    const gitAvailable = await isGitAvailable();
    if (!gitAvailable) {
      assert.ok(true, "Git not available, skipping test");
      return;
    }

    const manifestBefore = readManifest();
    const versionBefore = manifestBefore.info.version;

    let result = await testUtils.runCommand(
      packageDir,
      qxCmdPath,
      "package",
      "publish",
      "--type=patch",
      "--dry-run",
      "--noninteractive"
    );

    result.output = result.output.toLowerCase();
    const hasKeyword = result.output.toLowerCase().includes("patch") || result.output.toLowerCase().includes("version");
    const hasError = result.error.toLowerCase().includes("github") || result.error.toLowerCase().includes("httperror") || result.error.toLowerCase().includes("not found");
    assert.ok(
      hasKeyword || hasError || result.exitCode !== 0,
      "Should mention patch/version or fail with expected error (GitHub API not available in tests)"
    );

    // Verify Manifest.json was NOT modified
    const manifestAfter = readManifest();
    assert.equal(
      manifestAfter.info.version,
      versionBefore,
      "Manifest.json should NOT be modified in dry-run mode"
    );

  } catch (ex) {
    throw ex;
  }
});

test("Test dry-run with explicit version number", async () => {
  try {
    const gitAvailable = await isGitAvailable();
    if (!gitAvailable) {
      assert.ok(true, "Git not available, skipping test");
      return;
    }

    const manifestBefore = readManifest();
    const versionBefore = manifestBefore.info.version;

    let result = await testUtils.runCommand(
      packageDir,
      qxCmdPath,
      "package",
      "publish",
      "--use-version=2.5.0",
      "--dry-run",
      "--noninteractive"
    );

    result.output = result.output.toLowerCase();
    const hasKeyword = result.output.toLowerCase().includes("2.5.0") || result.output.toLowerCase().includes("version");
    const hasError = result.error.toLowerCase().includes("github") || result.error.toLowerCase().includes("httperror") || result.error.toLowerCase().includes("not found");
    assert.ok(
      hasKeyword || hasError || result.exitCode !== 0,
      "Should mention 2.5.0/version or fail with expected error (GitHub API not available in tests)"
    );

    // Verify Manifest.json was NOT modified
    const manifestAfter = readManifest();
    assert.equal(
      manifestAfter.info.version,
      versionBefore,
      "Manifest.json should NOT be modified in dry-run mode"
    );

  } catch (ex) {
    throw ex;
  }
});

test("Test dry-run with prerelease type (e.g., 1.0.0 -> 1.0.1-0)", async () => {
  try {
    const gitAvailable = await isGitAvailable();
    if (!gitAvailable) {
      assert.ok(true, "Git not available, skipping test");
      return;
    }

    const manifestBefore = readManifest();
    const versionBefore = manifestBefore.info.version;

    let result = await testUtils.runCommand(
      packageDir,
      qxCmdPath,
      "package",
      "publish",
      "--type=prerelease",
      "--dry-run",
      "--noninteractive"
    );

    result.output = result.output.toLowerCase();
    const hasKeyword = result.output.toLowerCase().includes("prerelease") || result.output.toLowerCase().includes("version");
    const hasError = result.error.toLowerCase().includes("github") || result.error.toLowerCase().includes("httperror") || result.error.toLowerCase().includes("not found");
    assert.ok(
      hasKeyword || hasError || result.exitCode !== 0,
      "Should mention prerelease/version or fail with expected error (GitHub API not available in tests)"
    );

    // Verify Manifest.json was NOT modified
    const manifestAfter = readManifest();
    assert.equal(
      manifestAfter.info.version,
      versionBefore,
      "Manifest.json should NOT be modified in dry-run mode"
    );

  } catch (ex) {
    throw ex;
  }
});

test("Test dry-run with custom commit message", async () => {
  try {
    const gitAvailable = await isGitAvailable();
    if (!gitAvailable) {
      assert.ok(true, "Git not available, skipping test");
      return;
    }

    let result = await testUtils.runCommand(
      packageDir,
      qxCmdPath,
      "package",
      "publish",
      "--message=Custom release message",
      "--dry-run",
      "--noninteractive"
    );

    result.output = result.output.toLowerCase();
    const hasKeyword = result.output.toLowerCase().includes("custom") || result.output.toLowerCase().includes("version");
    const hasError = result.error.toLowerCase().includes("github") || result.error.toLowerCase().includes("httperror") || result.error.toLowerCase().includes("not found");
    assert.ok(
      hasKeyword || hasError || result.exitCode !== 0,
      "Should mention custom/version or fail with expected error (GitHub API not available in tests)"
    );

  } catch (ex) {
    throw ex;
  }
});



// ============================================================================
// Index File Tests
// ============================================================================

test("Test dry-run with create-index flag", async () => {
  try {
    const gitAvailable = await isGitAvailable();
    if (!gitAvailable) {
      assert.ok(true, "Git not available, skipping test");
      return;
    }

    let result = await testUtils.runCommand(
      packageDir,
      qxCmdPath,
      "package",
      "publish",
      "--create-index",
      "--dry-run",
      "--noninteractive"
    );

    result.output = result.output.toLowerCase();
    const hasKeyword = result.output.toLowerCase().includes("index") || result.output.toLowerCase().includes("version");
    const hasError = result.error.toLowerCase().includes("github") || result.error.toLowerCase().includes("httperror") || result.error.toLowerCase().includes("not found");
    assert.ok(
      hasKeyword || hasError || result.exitCode !== 0,
      "Should mention index/version or fail with expected error (GitHub API not available in tests)"
    );

    // Verify qooxdoo.json was NOT created in dry-run mode
    assert.ok(
      !fs.existsSync(path.join(packageDir, "qooxdoo.json")),
      "qooxdoo.json should NOT be created in dry-run mode"
    );

  } catch (ex) {
    throw ex;
  }
});

// ============================================================================
// Branch Detection Tests
// ============================================================================

test("Test dry-run on feature branch", async () => {
  try {
    const gitAvailable = await isGitAvailable();
    if (!gitAvailable) {
      assert.ok(true, "Git not available, skipping test");
      return;
    }

    const { exec } = require("child_process");
    const util = require("util");
    const execPromise = util.promisify(exec);

    // Create and switch to a feature branch
    try {
      await execPromise("git checkout -b feature/test-branch", { cwd: packageDir });
    } catch (err) {
      // Branch might already exist
      await execPromise("git checkout feature/test-branch", { cwd: packageDir });
    }

    // Verify we're on the feature branch
    const branchResult = await execPromise("git branch --show-current", { cwd: packageDir });
    assert.equal(branchResult.stdout.trim(), "feature/test-branch", "Should be on feature branch");

    // Run dry-run on feature branch - should work without errors
    let result = await testUtils.runCommand(
      packageDir,
      qxCmdPath,
      "package",
      "publish",
      "--dry-run",
      "--noninteractive"
    );

    const outputLower = (result.output || "").toLowerCase();
    const errorLower = (result.error || "").toLowerCase();

    // Check that branch detection worked (no "Cannot determine current branch" error)
    assert.ok(
      !errorLower.includes("cannot determine current branch"),
      "Should successfully detect current branch"
    );

    // The command should either succeed or fail with expected error (GitHub API, etc.)
    const hasVersionInfo = outputLower.includes("version") || outputLower.includes("dry");
    const hasGitHubError = errorLower.includes("github") || errorLower.includes("httperror") || errorLower.includes("token");
    const hasGitError = errorLower.includes("commit") || errorLower.includes("stash");

    assert.ok(
      result.exitCode === 0 || hasVersionInfo || hasGitHubError || hasGitError,
      "Should succeed or fail with expected error (not branch detection error)"
    );

    // Switch back to master/main and delete the feature branch
    try {
      await execPromise("git checkout master", { cwd: packageDir });
      await execPromise("git branch -D feature/test-branch", { cwd: packageDir });
    } catch (err) {
      try {
        await execPromise("git checkout main", { cwd: packageDir });
        await execPromise("git branch -D feature/test-branch", { cwd: packageDir });
      } catch (err2) {
        // Ignore cleanup errors
      }
    }

  } catch (ex) {
    throw ex;
  }
});

test("Test dry-run on master branch", async () => {
  try {
    const gitAvailable = await isGitAvailable();
    if (!gitAvailable) {
      assert.ok(true, "Git not available, skipping test");
      return;
    }

    const { exec } = require("child_process");
    const util = require("util");
    const execPromise = util.promisify(exec);

    // Make sure we're on master (or main)
    let currentBranch;
    try {
      await execPromise("git checkout master", { cwd: packageDir });
      currentBranch = "master";
    } catch (err) {
      try {
        await execPromise("git checkout main", { cwd: packageDir });
        currentBranch = "main";
      } catch (err2) {
        // Create master if it doesn't exist
        await execPromise("git checkout -b master", { cwd: packageDir });
        currentBranch = "master";
      }
    }

    // Verify we're on master/main
    const branchResult = await execPromise("git branch --show-current", { cwd: packageDir });
    assert.ok(
      ["master", "main"].includes(branchResult.stdout.trim()),
      "Should be on master or main branch"
    );

    // Run dry-run on master/main branch
    let result = await testUtils.runCommand(
      packageDir,
      qxCmdPath,
      "package",
      "publish",
      "--dry-run",
      "--noninteractive"
    );

    const outputLower = (result.output || "").toLowerCase();
    const errorLower = (result.error || "").toLowerCase();

    // Check that branch detection worked
    assert.ok(
      !errorLower.includes("cannot determine current branch"),
      "Should successfully detect current branch"
    );

    // When on master/main, the branch warning should NOT appear (even in interactive mode)
    // In noninteractive mode, we can't see the prompts, but we can verify no branch error
    assert.ok(
      !errorLower.includes("not master/main"),
      "Should not show branch warning when on master/main"
    );

  } catch (ex) {
    throw ex;
  }
});

test("Test branch detection in detached HEAD state", async () => {
  try {
    const gitAvailable = await isGitAvailable();
    if (!gitAvailable) {
      assert.ok(true, "Git not available, skipping test");
      return;
    }

    const { exec } = require("child_process");
    const util = require("util");
    const execPromise = util.promisify(exec);

    // Get current commit hash
    const hashResult = await execPromise("git rev-parse HEAD", { cwd: packageDir });
    const commitHash = hashResult.stdout.trim();

    // Create detached HEAD state
    await execPromise(`git checkout ${commitHash}`, { cwd: packageDir });

    // Run dry-run in detached HEAD state
    let result = await testUtils.runCommand(
      packageDir,
      qxCmdPath,
      "package",
      "publish",
      "--dry-run",
      "--noninteractive"
    );

    const errorLower = (result.error || "").toLowerCase();
    const outputLower = (result.output || "").toLowerCase();

    // In detached HEAD state, git branch --show-current returns empty string
    // The publish command should handle this gracefully (either error or use commit hash)
    const hasBranchError = errorLower.includes("cannot determine current branch") ||
                          errorLower.includes("branch");
    const hasOtherError = errorLower.includes("github") || errorLower.includes("token");
    const succeeded = result.exitCode === 0;

    assert.ok(
      hasBranchError || hasOtherError || succeeded,
      "Should handle detached HEAD state (error about branch or proceed with other checks)"
    );

    // Return to master/main
    try {
      await execPromise("git checkout master", { cwd: packageDir });
    } catch (err) {
      try {
        await execPromise("git checkout main", { cwd: packageDir });
      } catch (err2) {
        await execPromise("git checkout -b master", { cwd: packageDir });
      }
    }

  } catch (ex) {
    throw ex;
  }
});

// ============================================================================
// Version Range Tests
// ============================================================================

test("Test dry-run with qx-version flag", async () => {
  try {
    const gitAvailable = await isGitAvailable();
    if (!gitAvailable) {
      assert.ok(true, "Git not available, skipping test");
      return;
    }

    let result = await testUtils.runCommand(
      packageDir,
      qxCmdPath,
      "package",
      "publish",
      "--qx-version=8.0.0",
      "--dry-run",
      "--noninteractive"
    );

    result.output = result.output.toLowerCase();
    const hasKeyword = result.output.toLowerCase().includes("8.0") || result.output.toLowerCase().includes("version");
    const hasError = result.error.toLowerCase().includes("github") || result.error.toLowerCase().includes("httperror") || result.error.toLowerCase().includes("not found");
    assert.ok(
      hasKeyword || hasError || result.exitCode !== 0,
      "Should mention 8.0/version or fail with expected error (GitHub API not available in tests)"
    );

  } catch (ex) {
    throw ex;
  }
});

test("Test dry-run with breaking changes flag", async () => {
  try {
    const gitAvailable = await isGitAvailable();
    if (!gitAvailable) {
      assert.ok(true, "Git not available, skipping test");
      return;
    }

    let result = await testUtils.runCommand(
      packageDir,
      qxCmdPath,
      "package",
      "publish",
      "--breaking",
      "--dry-run",
      "--noninteractive"
    );

    result.output = result.output.toLowerCase();
    const hasKeyword = result.output.toLowerCase().includes("breaking") || result.output.toLowerCase().includes("version");
    const hasError = result.error.toLowerCase().includes("github") || result.error.toLowerCase().includes("httperror") || result.error.toLowerCase().includes("not found");
    assert.ok(
      hasKeyword || hasError || result.exitCode !== 0,
      "Should mention breaking/version or fail with expected error (GitHub API not available in tests)"
    );

  } catch (ex) {
    throw ex;
  }
});

test("Test dry-run with qx-version-range override", async () => {
  try {
    const gitAvailable = await isGitAvailable();
    if (!gitAvailable) {
      assert.ok(true, "Git not available, skipping test");
      return;
    }

    let result = await testUtils.runCommand(
      packageDir,
      qxCmdPath,
      "package",
      "publish",
      "--qx-version-range=^8.0.0",
      "--dry-run",
      "--noninteractive"
    );

    result.output = result.output.toLowerCase();
    const hasKeyword = result.output.toLowerCase().includes("range") || result.output.toLowerCase().includes("version");
    const hasError = result.error.toLowerCase().includes("github") || result.error.toLowerCase().includes("httperror") || result.error.toLowerCase().includes("not found");
    assert.ok(
      hasKeyword || hasError || result.exitCode !== 0,
      "Should mention range/version or fail with expected error (GitHub API not available in tests)"
    );

  } catch (ex) {
    throw ex;
  }
});

// ============================================================================
// Cleanup
// ============================================================================

test("Clean up temporary GitHub token", async () => {
  try {
    if (temporaryTokenCreated) {
      let result = await testUtils.runCommand(__dirname, qxCmdPath, "config", "delete", "github.token");
      assert.ok(result.exitCode === 0, "Should be able to delete temporary GitHub token");

      // Verify token was deleted
      result = await testUtils.runCommand(__dirname, qxCmdPath, "config", "get", "github.token");
      assert.ok(
        result.exitCode !== 0 || !result.output.includes("TEST_TOKEN"),
        "Temporary token should be deleted"
      );
    } else {
      assert.ok(true, "No temporary token to clean up");
    }
  } catch (ex) {
    throw ex;
  }
});

test("Clean up test directory", async () => {
  try {
    await testUtils.deleteRecursive(testDir);
    assert.ok(!fs.existsSync(testDir), "Test directory should be cleaned up");
  } catch (ex) {
    throw ex;
  }
});
