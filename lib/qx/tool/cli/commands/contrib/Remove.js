/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Christian Boulanger

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */
require("../Contrib");

require("@qooxdoo/framework");
const fs = require("fs");
const process = require("process");
const path = require("upath");
const rimraf = require("rimraf");

/**
 * Installs a contrib libraries
 */
qx.Class.define("qx.tool.cli.commands.contrib.Remove", {
  extend: qx.tool.cli.commands.Contrib,

  statics: {
    getYargsCommand: function() {
      return {
        command: "remove [contrib_uri]",
        describe: "removes a contrib library from the configuration.",
        builder: {
          "verbose": {
            alias: "v",
            describe: "Verbose logging"
          },
          "quiet": {
            alias: "q",
            describe: "No output"
          }
        },
        handler: function(argv) {
          return new qx.tool.cli.commands.contrib.Remove(argv)
            .process()
            .catch(e => {
              console.error(e.stack || e.message);
              process.exit(1);
            });
        }
      };
    }
  },

  members: {

    /**
     * Removes contrib libraries
     */
    process: async function() {
      if (!this.argv.contrib_uri) {
        throw new qx.tool.cli.Utils.UserError("No repository name given.");
      }
      // read libraries array from contrib.json
      let data = await this.getContribData();
      // currently, the contrib uri is github_username/repo_name[/path/to/repo].
      let parts = this.argv.contrib_uri.split(/\//);
      let tag = (parts.length > 2)?"uri":"repo_name";

      let found = [];
      let libraries = [];
      for (const elem of data.libraries) {
        if (elem[tag] === this.argv.contrib_uri) {
          await this.__removeApplication(elem.uri);
          await this.__deleteRequiredFromManifest(elem.uri);
          let c = elem.path.split(/\//).length;
          let p = elem.path;
          if (c > parts.length) {
            p = path.dirname(p);
          }
          if (!found.includes(p)) {
            found.push(p);
          }
        } else {
          libraries.push(elem);
        }
      }
      if (found.length) {
        for (const p of found) {
          rimraf.sync(p);
        }
        if (!this.argv.quiet) {
          console.info(`Deleted ${found.length} entries for ${this.argv.contrib_uri}`);
        }
      } else if (this.argv.verbose) {
        console.warn(`No entry for ${this.argv.contrib_uri}`);
      }
      data.libraries = libraries;
      fs.writeFileSync(this.getContribFileName(), JSON.stringify(data, null, 2), "utf-8");

      if (this.argv.verbose) {
        console.info(">>> Done.");
      }
    },

    __deleteRequiredFromManifest: async function(uri) {
      let manifest = await qx.tool.compiler.utils.Json.loadJsonAsync("Manifest.json");
      if (manifest.requires && manifest.requires[uri]) {
        delete manifest.requires[uri];
        await qx.tool.compiler.utils.Json.saveJsonAsync("Manifest.json", manifest);
      }
    },

    /**
     * Removes installed applications
     * @param uri
     * @return {Promise<void>}
     * @private
     */
    __removeApplication: async function(uri) {
      let contribJson = await this.getContribData();
      let libraryJson = contribJson.libraries.find(data => data.uri === uri);
      if (!libraryJson) {
        throw new Error("Repo for " + uri + " is not installed as a contrib");
      }

      let manifest = await qx.tool.compiler.utils.Json.loadJsonAsync(path.join(libraryJson.path, "Manifest.json"));
      if (!manifest || !manifest.provides || !manifest.provides.application) {
        if (this.argv.verbose) {
          console.info(">>> No application to remove.");
        }
        return;
      }

      let compileJson = await qx.tool.compiler.utils.Json.loadJsonAsync("compile.json");
      let manifestApp = manifest.provides.application;
      let app = compileJson.applications.find(app => {
        if (manifestApp.name && app.name) {
          return manifestApp.name === app.name;
        }
        return manifestApp["class"] === app["class"];
      });
      if (app) {
        let idx = compileJson.applications.indexOf(app);
        compileJson.applications.splice(idx, 1);

        if (this.argv.verbose) {
          console.info(">>> Removed application " + (app.name||app["class"]));
        }
        await qx.tool.compiler.utils.Json.saveJsonAsync("compile.json", compileJson);
      }
    }
  }
});
