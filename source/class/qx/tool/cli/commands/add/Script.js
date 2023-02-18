/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Christian Boulanger and others

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */

const fs = require("fs");
const process = require("process");
const path = require("upath");
const inquirer = require("inquirer");
/**
 * Add a new script file to the current project, to be loaded by the qooxdoo boot loader
 *
 * Syntax: `qx add script path/to/script.js`
 *
 */
qx.Class.define("qx.tool.cli.commands.add.Script", {
  extend: qx.tool.cli.commands.Command,
  statics: {
    getYargsCommand() {
      return {
        command: "script <scriptpath> [options]",
        describe:
          "adds a new script file to the current project, to be loaded before application startup.",
        builder: {
          resourcedir: {
            describe:
              "The subdirectory of the resource folder in which to place the file",
            alias: "d",
            default: "js"
          },

          rename: {
            describe: "Rename the file to the given name",
            alias: "r"
          },

          undo: {
            describe:
              "Removes the file that would normally be added with the given arguments",
            alias: "z"
          },

          noninteractive: {
            alias: "I",
            describe: "Do not prompt user"
          }
        }
      };
    }
  },

  members: {
    async process() {
      let manifestModel = await qx.tool.config.Manifest.getInstance().load();
      let namespace = manifestModel.getValue("provides.namespace");

      let script_path = this.argv.scriptpath;
      let script_name = path.basename(script_path);
      let resource_dir_path = path.join(
        process.cwd(),
        "source",
        "resource",
        namespace,
        this.argv.resourcedir
      );

      let resource_file_path = path.join(
        resource_dir_path,
        this.argv.rename || script_name
      );

      let external_res_path = path.join(
        namespace,
        this.argv.resourcedir,
        this.argv.rename || script_name
      );

      // validate file paths
      if (!script_path.endsWith(".js")) {
        throw new qx.tool.utils.Utils.UserError(
          "File doesn't seem to be a javascript file."
        );
      }
      if (!(await fs.existsAsync(script_path)) && !this.argv.undo) {
        throw new qx.tool.utils.Utils.UserError(
          `File does not exist: ${script_path}`
        );
      }
      if ((await fs.existsAsync(resource_file_path)) && !this.argv.undo) {
        if (!this.argv.noninteractive) {
          let question = {
            type: "confirm",
            name: "doOverwrite",
            message: `Script already exists and will be overwritten. Do you want to proceed?`,
            default: "y"
          };

          let answer = await inquirer.prompt(question);
          if (!answer.doOverwrite) {
            process.exit(0);
          }
        }
      }
      // check manifest structure
      let script_list =
        manifestModel.getValue("externalResources.script") || [];
      if (this.argv.undo) {
        // undo, i.e. remove file from resource folder and Manifest
        if (script_list.includes(external_res_path)) {
          script_list = script_list.filter(elem => elem !== external_res_path);
        }
        if (await fs.existsAsync(resource_file_path)) {
          await fs.unlinkAsync(resource_file_path);
        }
      } else {
        // copy script to app resources and add to manifest
        if (!(await fs.existsAsync(resource_dir_path))) {
          fs.mkdirSync(resource_dir_path, {
            recursive: true,
            mode: 0o755
          });
        }
        await fs.copyFileAsync(script_path, resource_file_path);
        if (!script_list.includes(external_res_path)) {
          script_list.push(external_res_path);
        }
      }
      // save
      this.debug(script_list);
      await manifestModel
        .setValue("externalResources.script", script_list)
        .save();
    }
  }
});
