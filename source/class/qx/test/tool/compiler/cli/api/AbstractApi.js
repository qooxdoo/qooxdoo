/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Henner Kollmann

************************************************************************ */

const fs = require("fs");
const os = require("os");
const path = require("path");

qx.Class.define("qx.test.tool.compiler.cli.api.AbstractApi", {
  extend: qx.dev.unit.TestCase,

  statics: {
    PROJECT_PACKAGE_JSON: JSON.stringify({
      name: "test-project",
      version: "1.0.0"
    })
  },

  members: {
    __cwd: null,
    __projectDir: null,

    setUp() {
      this.__cwd = process.cwd();
      let tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "qx-test-api-require-")));
      this.__projectDir = path.join(tmpDir, "packages", "app");
      fs.mkdirSync(this.__projectDir, { recursive: true });
      fs.writeFileSync(path.join(this.__projectDir, "package.json"), this.self(arguments).PROJECT_PACKAGE_JSON);
      process.chdir(this.__projectDir);
    },

    tearDown() {
      process.chdir(this.__cwd);
      fs.rmSync(path.dirname(path.dirname(this.__projectDir)), {
        recursive: true,
        force: true
      });
    },

    testResolvesModuleProvidedByProject() {
      let workspaceDir = path.dirname(path.dirname(this.__projectDir));
      this.__createFakeModule(workspaceDir, "qx-test-hoisted-module");
      let api = this.__createApi(true);

      this.assertJsonEquals({ name: "qx-test-hoisted-module" }, api.require("qx-test-hoisted-module"));
      this.assertArrayEquals([], api.npmInstalls);
      this.assertFalse(fs.existsSync(path.join(this.__projectDir, "node_modules")));
    },

    testInstallsMissingModuleIntoLocalNpmDir() {
      let api = this.__createApi(true);
      let npmDir = path.join(this.__projectDir, "qx_packages", ".npm");
      this.assertEquals(npmDir, api._getLocalNpmDir());

      this.assertJsonEquals({ name: "qx-test-installed-module" }, api.require("qx-test-installed-module"));
      api.require("qx-test-installed-module");

      this.assertJsonEquals([{ module: "qx-test-installed-module", npmDir }], api.npmInstalls);
      this.assertFalse(fs.existsSync(path.join(this.__projectDir, "node_modules")));
      this.assertEquals(this.self(arguments).PROJECT_PACKAGE_JSON, fs.readFileSync(path.join(this.__projectDir, "package.json"), "utf8"));
    },

    testThrowsUserErrorWhenModuleIsStillMissing() {
      let api = this.__createApi(false);
      this.assertException(
        () => api.require("qx-test-uninstallable-module"),
        qx.tool.utils.Utils.UserError,
        "The npm module 'qx-test-uninstallable-module' is required but not installed. Please run: npm install --save-dev qx-test-uninstallable-module"
      );
    },

    testThrowsUserErrorWhenInstallFails() {
      let api = this.__createApi(false);
      api._installNpmModule = () => {
        throw new Error("npm failed");
      };
      this.assertException(
        () => api.require("qx-test-failing-module"),
        qx.tool.utils.Utils.UserError,
        /could not be installed .*npm failed/
      );
    },

    __createFakeModule(dir, name) {
      let moduleDir = path.join(dir, "node_modules", name);
      fs.mkdirSync(moduleDir, { recursive: true });
      fs.writeFileSync(path.join(moduleDir, "package.json"), JSON.stringify({ name, version: "1.0.0", main: "index.js" }));
      fs.writeFileSync(path.join(moduleDir, "index.js"), `module.exports = { name: ${JSON.stringify(name)} };`);
    },

    __createApi(install) {
      let api = new qx.tool.compiler.cli.api.LibraryApi();
      api.npmInstalls = [];
      api._installNpmModule = (module, npmDir) => {
        api.npmInstalls.push({ module, npmDir });
        if (install) {
          this.__createFakeModule(npmDir, module);
        }
      };
      return api;
    }
  }
});
