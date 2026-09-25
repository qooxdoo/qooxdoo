/**
 * Integration tests for `qx compile`.
 *
 * Covers the custom-compiler spawning path, in particular the fix that prevents
 * --clean from being forwarded to the spawned inner compiler.  Without the fix
 * the inner compiler would erase the outer compiler's output directory while
 * the outer process is still running (dangerous on all platforms, fatal on
 * Windows where open files cannot be deleted).
 */

const { test } = require("node:test");
const assert = require("node:assert");
const fsp = require("fs").promises;
const path = require("path");
const testUtils = require("../../../bin/tools/utils");

const qxCmdPath = testUtils.getCompiler();
const testDir = path.join(__dirname, "test-qx-compile");
const projectDir = path.join(testDir, "myproject");
const compiledDir = path.join(projectDir, "compiled");
const customCompilerDir = path.join(compiledDir, "source", "custom-compiler");
const argvFile = path.join(projectDir, "custom-compiler-argv.json");

async function cleanup() {
  await testUtils.deleteRecursive(compiledDir);
  try {
    await fsp.unlink(argvFile);
  } catch (_) {}
}

async function runCompile(...extraArgs) {
  return testUtils.runCommand(projectDir, qxCmdPath, "compile", ...extraArgs);
}

test("compile --clean with custom compiler: outer compiler rebuilds, inner compiler does not receive --clean", async () => {
  await cleanup();

  // First pass: build so the custom compiler binary exists.
  let result = await runCompile();
  assert.ok(result.exitCode === 0, `First compile failed:\n${testUtils.reportError(result)}`);

  let stat = await fsp.stat(customCompilerDir);
  assert.ok(stat.isDirectory(), "compiled/source/custom-compiler must exist after first compile");

  // Place a sentinel file.  The outer compiler's --clean must remove it (full
  // rebuild), while the inner compiler must NOT remove it (--clean not forwarded).
  const sentinelFile = path.join(customCompilerDir, "sentinel.txt");
  await fsp.writeFile(sentinelFile, "deleted by outer --clean, not by inner compiler");

  // Second pass with --clean.
  result = await runCompile("--clean");
  assert.ok(result.exitCode === 0, `Compile with --clean failed:\n${testUtils.reportError(result)}`);

  // Sentinel gone → outer compiler erased and rebuilt the custom compiler.
  let sentinelExists = false;
  try {
    await fsp.stat(sentinelFile);
    sentinelExists = true;
  } catch (_) {}
  assert.ok(!sentinelExists, "Sentinel must be deleted by the outer compiler's --clean (proves rebuild)");

  // Custom-compiler dir still present → inner compiler did not erase it.
  stat = await fsp.stat(customCompilerDir);
  assert.ok(stat.isDirectory(), "compiled/source/custom-compiler must be recreated by outer compiler after --clean");

  // argv recorded by the inner compiler must not contain --clean.
  let raw;
  try {
    raw = await fsp.readFile(argvFile, "utf8");
  } catch (_) {
    assert.fail(`Inner compiler did not write ${argvFile} — was it spawned at all?`);
  }
  const argv = JSON.parse(raw);
  const hasClean = argv.some(arg => arg === "--clean" || arg === "--no-clean");
  assert.ok(!hasClean, `--clean must NOT be forwarded to the inner compiler, but received: ${JSON.stringify(argv)}`);

  await cleanup();
});

test("compile without --clean: outer compiler does not erase output, inner compiler does not receive --clean", async () => {
  await cleanup();

  // First pass: build so the custom compiler binary exists.
  let result = await runCompile();
  assert.ok(result.exitCode === 0, `First compile failed:\n${testUtils.reportError(result)}`);

  // Place a sentinel file.  Without --clean it must survive the second compile.
  const sentinelFile = path.join(customCompilerDir, "sentinel.txt");
  await fsp.writeFile(sentinelFile, "must survive incremental rebuild");

  // Second pass without --clean.
  result = await runCompile();
  assert.ok(result.exitCode === 0, `Second compile failed:\n${testUtils.reportError(result)}`);

  // Sentinel must still exist — no clean was requested.
  let stat;
  try {
    stat = await fsp.stat(sentinelFile);
  } catch (_) {
    assert.fail("Sentinel was deleted without --clean — the outer compiler must not erase the output dir");
  }
  assert.ok(stat.isFile(), "Sentinel must survive an incremental (no --clean) rebuild");

  // argv recorded by the inner compiler must not contain --clean.
  let raw;
  try {
    raw = await fsp.readFile(argvFile, "utf8");
  } catch (_) {
    assert.fail(`Inner compiler did not write ${argvFile} — was it spawned at all?`);
  }
  const argv = JSON.parse(raw);
  const hasClean = argv.some(arg => arg === "--clean" || arg === "--no-clean");
  assert.ok(!hasClean, `--clean must not appear in inner compiler argv without being requested, but received: ${JSON.stringify(argv)}`);

  await cleanup();
});
