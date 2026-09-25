const fs = require("fs");
const path = require("path");
const child_process = require("child_process");

const fsPromises = fs.promises;

let DEBUG = false;


/**
 * Return the path to the compiler executable, unless the "QX_JS" OS environment
 * variable is set, in which case the content of this variable is returned.
 *
 * @param {String} buildVersion? The build version, defaults to "build"
 * @return {String}
 */
function getCompiler(buildVersion = "build") {
  return process.env.QX_JS || path.join(__dirname, "..", buildVersion, "qx");
}

function parseMessages(result) {
  result.messages = [];
  for (const line of result.output.split("\n")) {
    const m = line.match(/^##([^:]+):\[(.*)\]$/);
    if (!m) continue;
    const raw = m[2].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    result.messages.push({
      id: m[1],
      args: raw.map(arg => (arg.startsWith('"') && arg.endsWith('"') ? arg.slice(1, -1) : arg))
    });
  }
  return result;
}

async function runCompiler(dir, ...cmd) {
  return parseMessages(await runCommand(dir, getCompiler(), "compile", "--machine-readable", ...cmd));
}

async function debugCompiler(dir, ...cmd) {
  return parseMessages(await runCommand(dir, getCompiler("source"), "compile", "--machine-readable", ...cmd));
}

async function runCommand(dir, ...args) {
  let originalCmd = args.shift();
  let env = Object.assign({}, process.env);
  if (DEBUG) {
    env.QOOXDOO_DEBUG = "true";
  }
  return new Promise((resolve, reject) => {
    if (DEBUG) {
      console.debug(`    [[DEBUG]] Running command in ${dir}: ${originalCmd} ${args.join(" ")}`);
    }
    let proc = child_process.spawn(originalCmd, args, {
      cwd: dir,
      env: env,
      shell: process.platform === "win32"
    });
    let result = { exitCode: null, output: "", error: "", messages: null };
    proc.stdout.on("data", data => { 
      data = data.toString().trim(); 
      console.log(data); 
      result.output += data; 
    });
    proc.stderr.on("data", data => { 
      data = data.toString().trim(); 
      console.error(data); 
      result.error += data; 
    });
    proc.on("close", code => { 
      result.exitCode = code; 
      resolve(result); 
    });
    proc.on("error", reject);
  });
}

async function deleteRecursive(name) {
  await fs.promises.rm(name, { recursive: true, force: true });
}

async function safeDelete(filename) {
  await fs.promises.rm(filename, { force: true });
}

function defaultOptions() {
  return { clean: true, version: null, target: "build", incVersion: false };
}

async function bootstrapCompiler(options) {
  if (!options) {
    options = defaultOptions();
  }

  if (options.clean) {
    console.log("Deleting previous bootstrap compiler");
    await deleteRecursive("bootstrap");
    await deleteRecursive("known-good/node_modules");
  }

  console.log(`Creating temporary compiler with known-good one, target=${options.target}`);
  let result = await runCommand("known-good", "node", "../bin/known-good/qx", "compile", "--target=" + options.target);
  if (result.exitCode) { 
    console.log("Error compiling known-good:", result.exitCode); 
    return result.exitCode; 
  }

  await fs.promises.writeFile("bootstrap/qx",
`#!/usr/bin/env node
const path=require("path");
require("../source/resource/qx/tool/compiler/loadsass.js");
require(path.join(__dirname, "compiled", "node", "${options.target}", "compiler"));
`, "utf8");
  fs.chmodSync("bootstrap/qx", "777");
  fs.copyFileSync("bin/build/qx.cmd", "bootstrap/qx.cmd");

  if (options.initialOnly) {
    return;
  }

  console.log("Compiling source version");
  result = await runCommand(".", "node", "./bootstrap/qx", "compile", "--target=source", "--clean");
  if (result.exitCode) { 
    console.log("Error compiling source version:", result.exitCode); 
    return result.exitCode; 
  }

  console.log("Compiling build version");
  result = await runCommand(".", "node", "./bootstrap/qx", "compile", "--target=build", "--clean");
  if (result.exitCode) { 
    console.log("Error compiling build version:", result.exitCode); 
    return result.exitCode; 
  }

  console.log("Compiler successfully bootstrapped");
  return 0;
}

async function findAllFiles(dir, fnEach) {
  let filenames;
  try {
    filenames = await fs.promises.readdir(dir);
  } catch (ex) {
    if (ex.code === "ENOENT") return;
    throw ex;
  }
  await Promise.all(filenames.map(async shortName => {
    const filename = path.join(dir, shortName);
    const stat = await fs.promises.stat(filename);
    if (stat.isDirectory()) {
      await findAllFiles(filename, fnEach);
    } else {
      await fnEach(filename);
    }
  }));
}

async function safeStat(filename) {
  try {
    return await fs.promises.stat(filename);
  } catch (ex) {
    if (ex.code === "ENOENT") return null;
    throw ex;
  }
}

async function safeUnlink(filename) {
  await fs.promises.rm(filename, { force: true });
}

async function safeRename(from, to) {
  try {
    await fs.promises.rename(from, to);
  } catch (ex) {
    if (ex.code !== "ENOENT") throw ex;
  }
}

async function copyFile(from, to) {
  await fs.promises.mkdir(path.dirname(to), { recursive: true });
  await fs.promises.copyFile(from, to);
}

async function sync(from, to, filter) {
  const statFrom = await safeStat(from);
  if (!statFrom) {
    return;
  }
  const statTo = await safeStat(to);

  if (!statTo || statFrom.isDirectory() !== statTo.isDirectory()) {
    await fs.promises.rm(to, { recursive: true, force: true });
  }

  if (statFrom.isDirectory()) {
    await fs.promises.mkdir(to, { recursive: true });
    const files = await fs.promises.readdir(from);
    await Promise.all(files.map(f => sync(path.join(from, f), path.join(to, f), filter)));
  } else if (statFrom.isFile()) {
    if (!statTo || statFrom.mtime.getTime() > statTo.mtime.getTime() || statFrom.size !== statTo.size) {
      if (!filter || await filter(from, to)) {
        await copyFile(from, to);
      }
    }
  }
}

/**
 * Normalises the path and corrects the case of the path to match what is actually on the filing system
 */
async function correctCase(dir) {
  let drivePrefix = "";
  if (process.platform === "win32" && /^[a-zA-Z]:/.test(dir)) {
    drivePrefix = dir.substring(0, 2);
    dir = dir.substring(2);
  }
  dir = dir.replace(/\\/g, "/");

  try {
    await fs.promises.stat(drivePrefix + dir);
  } catch (ex) {
    if (ex.code === "ENOENT") return drivePrefix + dir;
    throw ex;
  }

  const segs = dir.split("/");
  let current = segs[0].length === 0 ? "/" : "";
  const start = segs[0].length === 0 ? 1 : 0;

  for (let i = start; i < segs.length; i++) {
    const seg = segs[i];
    if (seg === "." || seg === "..") {
      current = (current && current !== "/") ? current + "/" + seg : current + seg;
      continue;
    }
    const readDir = current.length === 0 ? "." : drivePrefix + current;
    const files = await fs.promises.readdir(readDir, { encoding: "utf8" });
    const lower = seg.toLowerCase();
    const match = files.find(f => f === seg) || files.find(f => f.toLowerCase() === lower) || seg;
    current = (current && current !== "/") ? current + "/" + match : current + match;
  }

  if (process.platform === "win32") current = current.replace(/\//g, "\\");
  return drivePrefix + current;
}

function reportError(result) {
  return new Error(`*** The command exited with an ExitCode: ${result.exitCode}\n*** ERROR:\n${result.error}.\n*** OUTPUT: ${result.output}. `);
}

function setDebug(enabled) {
  DEBUG = enabled;
}

module.exports = {
  getCompiler,
  runCompiler,
  debugCompiler,
  runCommand,
  defaultOptions,
  bootstrapCompiler,
  deleteRecursive,
  safeDelete,
  findAllFiles,
  sync,
  copyFile,
  safeStat,
  safeUnlink,
  safeRename,
  correctCase,
  reportError,
  fsPromises,
  setDebug
};
