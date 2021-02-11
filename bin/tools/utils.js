const fs = require("fs");
const path = require("path");
const async = require("async");
const child_process = require("child_process");
//var fsPromises = require("fs").promises;
// node 8 compatibility
const {promisify} = require('util');

const fsPromises = {
  readFile: promisify(fs.readFile),
  writeFile: promisify(fs.writeFile),
  unlink: promisify(fs.unlink),
  mkdir: promisify(fs.mkdir)
};

function getCompiler() {
  let qxJs = process.env.QX_JS;
  if (!qxJs) {
    qxJs = path.join(__dirname, "..", "build", "qx");
  } 
  return qxJs;
}

async function runCompiler(dir, ...cmd) {
  let result = await runCommand(dir, getCompiler(), "compile", "--machine-readable", ...cmd);
  result.messages = [];
  result.output.split("\n").forEach(line => {
    let m = line.match(/^\#\#([^:]+):\[(.*)\]$/);
    if (m) {
      let args = m[2].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (args) {
        args = args.map(arg => {
          if (arg.length && arg[0] == "\"" && arg[arg.length - 1] == "\"")
            return arg.substring(1, arg.length - 1);
          return arg;
        });
      } else {
        args = [];
      }
      result.messages.push({
        id: m[1],
        args: args
      });
    }
  });
  return result;
}

async function runCommand(dir, ...args) {
  return new Promise((resolve, reject) => {
    let cmd = args.shift();
    let proc = child_process.spawn(cmd, args, {
      cwd: dir,
      shell: true
    });
    let result = {
        exitCode: null,
        output: "",
        error: "",
        messages: null
    };
    proc.stdout.on('data', (data) => {
      data = data.toString().trim();
      console.log(data);
      result.output += data;
    });
    proc.stderr.on('data', (data) => {
      data = data.toString().trim();
      console.error(data);
      result.error += data;
    });

    proc.on('close', code => {
      result.exitCode = code;
      resolve(result);
    });
    proc.on('error', err => {
       reject(err);
    });
  });
}

async function deleteRecursive(name) {
  return new Promise((resolve, reject) => {
    fs.exists(name, function (exists) {
      if (!exists) {
        return resolve();
      }
      deleteRecursiveImpl(name, err => {
        if (err) {
          reject(err);
        } else {
          resolve(err);
        }
      });
      return null;
    });

    function deleteRecursiveImpl(name, cb) {
      fs.stat(name, function (err, stat) {
        if (err) {
          return cb && cb(err);
        }

        if (stat.isDirectory()) {
          fs.readdir(name, function (err, files) {
            if (err) {
              return cb && cb(err);
            }
            async.each(files,
                function (file, cb) {
                  deleteRecursiveImpl(name + "/" + file, cb);
                },
                function (err) {
                  if (err) {
                    return cb && cb(err);
                  }
                  fs.rmdir(name, cb);
                  return null;
                }
            );
            return null;
          });
        } else {
          fs.unlink(name, cb);
        }
        return null;
      });
    }
  });
}

async function safeDelete(filename) {
  try {
    await fsPromises.unlink(filename);
  } catch(ex) {
    if (ex.code == "ENOENT")
      return;
    throw ex;
  }
}

async function bootstrapCompiler(options) {
  if (!options)
    options = {};
  let result;

  let target = options.target || "build";
    
  if (options.clean === undefined || options.clean) {
    console.log("Deleting previous bootstrap compiler");
    await deleteRecursive("bootstrap");
  }
  
  let cls = 
`/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */
/**
 * NOTE: This is automatically generated by bootstrap-compiler.js
*/
qx.Class.define("qx.tool.compiler.Version", {
  extend: qx.core.Object,
  statics: {
    VERSION: "${options.version}"
  }
});      
`;

  fs.writeFileSync("./source/class/qx/tool/compiler/Version.js", cls);
  
  // Use the compiler in node_modules to compile a temporary version  
  console.log("Creating temporary compiler with known-good one");
  result = await runCommand(".", "node", "./bin/known-good/qx", "compile", "--target=" + target, "--output-path-prefix=bootstrap", "--app-name=compiler");
  if (result.exitCode) {
    process.exit(result.exitCode);
  }
  
  // Create a handy `qx` binary for that version
  await fsPromises.writeFile("bootstrap/qx", 
`#!/usr/bin/env node
const path=require("path");
require(path.join(__dirname, "compiled", "node", "${target}", "compiler"));
`, "utf8");
fs.chmodSync("bootstrap/qx", "777");
fs.copyFileSync("bin/build/qx.cmd", "bootstrap/qx.cmd");
  
  /*
   * Now use the new ./bootstrap/ compiler to compile itself again; the output goes into the 
   *  normal `compiled` directory, ready for use.
   *
   * Note that we compile both source and build targets; this is because some of 
   *  the unit tests have to refer to the compiled code and we want to be sure that
   *  it does not matter if they use source or build, just make sure it is up to date
   */
  console.log("Compiling source version");
  result = await runCommand(".", "node", "./bootstrap/qx", "compile", "--clean", "--verbose");
  if (result.exitCode) {
    process.exit(result.exitCode);
  }

  console.log("Compiling build version");
  result = await runCommand(".", "node", "./bootstrap/qx", "compile", "--target=build", "--clean", "--verbose");
  if (result.exitCode) {
    process.exit(result.exitCode);
  }

  console.log("Compiler successfully bootstrapped");
}

module.exports = {
  getCompiler,
  runCompiler,
  runCommand,
  bootstrapCompiler,
  deleteRecursive,
  safeDelete,
  fsPromises,
  promisify
};

