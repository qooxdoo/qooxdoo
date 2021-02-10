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
     * Henner Kollmann (hkollmann)

************************************************************************ */
const fs = require("fs");
const path = require("upath");
const inquirer = require("inquirer");


/**
 * Create a new qooxdoo project. This will assemble the information needed to create the
 * new project by the following ways, in order of precedence:
 * 1. use parameters passed to the CLI command via the options
 * 2. if available, retrieve the info from the given environment
 * 3. ask the user the missing values interactively, offering default values where available
 * The variables needed are stored in the templates/template_vars.js file, together
 * with some metadata.
 *
 * Issues: automatic determination of qooxdoo path doesn't work yet.
 */
qx.Class.define("qx.tool.cli.commands.Create", {
  extend: qx.tool.cli.commands.Command,
  statics: {
    getYargsCommand: function() {
      return {
        command: "create <application namespace> [options]",
        describe: "creates a new qooxdoo project.",
        builder: {
          "type": {
            alias : "t",
            describe : "Type of the application to create. Must be one of " + this.getSkeletonNames().join(", "),
            nargs: 1,
            requiresArg: true,
            type: "string"
          },
          "out":{
            alias: "o",
            describe: "Output directory for the application content."
          },
          "namespace":{
            alias: "s",
            describe: "Top-level namespace."
          },
          "name":{
            alias: "n",
            describe: "Name of application/library (defaults to namespace)."
          },
          "theme":{
            describe: "The name of the theme to be used.",
            default : "indigo"
          },
          "icontheme":{
            describe: "The name of the icon theme to be used.",
            default : "Tango"
          },
          "noninteractive":{
            alias : "I",
            describe: "Do not prompt for missing values"
          },
          "verbose":{
            alias : "v",
            describe: "Verbose logging"
          }
        }
      };
    },
    /**
     * Returns the names of the skeleton directories in the template folder
     * @returns {string[]}
     */
    getSkeletonNames: function() {
      // need access to an non static method...
      let dir = path.join(this.prototype.getTemplateDir(), "skeleton");
      let res = fs
        .readdirSync(dir)
        .filter(entry => {
          try {
            return fs.existsSync(`${dir}/${entry}/Manifest.tmpl.json`);
          } catch (e) {
            return false;
          }
        });
      return res;
    }
  },

  members: {

    /**
     * Creates a new qooxdoo application
     */
    process: async function() {
      // init
      let argv = this.argv;
      let data = {};
      let questions = [];
      let values = {};

      // qooxdoo path
      data.qooxdoo_path = await this.getUserQxPath(); // use CLI options, if available

      // qooxdoo version
      try {
        data.qooxdoo_version = await this.getLibraryVersion(data.qooxdoo_path);
      } catch (e) {
        qx.tool.compiler.Console.error(e.message);
        throw new qx.tool.utils.Utils.UserError("Cannot find qooxdoo framework folder.");
      }

      // get map of metdata on variables that need to be inserted in the templates
      data.template_dir = this.getTemplateDir();
      data.getLibraryVersion = this.getLibraryVersion.bind(this);
      let template_vars;
      
      const template_vars_path = path.join(this.getTemplateDir(), "template_vars");
      template_vars = require(template_vars_path)(argv, data);

      // prepare inquirer question data
      for (let var_name of Object.getOwnPropertyNames(template_vars)) {
        let v = template_vars[var_name];
        let deflt = typeof v.default === "function" ? v.default() : v.default;

        // we have a final value that doesn't need to be asked for / confirmed.
        if (v.value !== undefined) {
          values[var_name] = typeof v.value === "function" ? v.value.call(values) : v.value;
          continue;
        }
        // do not ask for optional values in non-interactive mode
        if (argv.noninteractive) {
          if (v.optional || deflt) {
            values[var_name] = deflt;
            continue;
          }
          throw new qx.tool.utils.Utils.UserError(`Cannot skip required value for '${var_name}'.`);
        }
        // ask user
        let message = `Please enter ${v.description} ${v.optional?"(optional)":""}:`;
        questions.push({
          type: v.type || "input",
          choices: v.choices,
          name: var_name,
          message,
          default : v.default,
          validate : (v.validate || function(answer, hash) {
            return true;
          })
        });
      }

      // ask user for missing values
      let answers;
      try {
        answers = await inquirer.prompt(questions);
      } catch (e) {
        throw new qx.tool.utils.Utils.UserError(e.message);
      }

      // finalize values
      for (let var_name of Object.getOwnPropertyNames(template_vars)) {
        let value = values[var_name];

        // combine preset and inquirer data
        if (answers[var_name] !== undefined) {
          value = answers[var_name];
        }

        // handle special cases
        switch (var_name) {
          case "namespace":
          // match valid javascript object accessor TODO: allow unicode characters
            if (!value.match(/^([a-zA-Z_$][0-9a-zA-Z_$]*\.?)+$/)) {
              throw new qx.tool.utils.Utils.UserError(`Illegal characters in namespace "${value}."`);
            }
            break;

          case "locales":
            value = JSON.stringify(value.split(/,/).map(locale => locale.trim()));
            break;

          // this sets 'authors' and 'authors_map'
          case "authors": {
            if (value === undefined) {
              values.author_map = "[]";
              break;
            }
            let authors = value.split(/,/).map(a => a.trim());
            values.author_map = JSON.stringify(authors.map(author => {
              let parts = author.split(/ /);
              let email = parts.pop();
              return {
                name : parts.join(" "),
                email
              };
            }), null, 2);
            value = authors.join("\n"+(" ".repeat(12)));
            break;
          }
        }

        // update value
        values[var_name] = value;
      }

      // create application folder if it doesn't exist
      let appdir = path.normalize(values.out);
      if (!fs.existsSync(appdir)) {
        let parentDir = path.dirname(appdir);
        if (!fs.existsSync(parentDir)) {
          throw new qx.tool.utils.Utils.UserError(`Invalid directory ${appdir}`);
        }
        try {
          fs.accessSync(parentDir, fs.constants.W_OK);
        } catch (e) {
          throw new qx.tool.utils.Utils.UserError(`Directory ${parentDir} is not writable.`);
        }
        fs.mkdirSync(appdir);
      }

      // skeleton dir might come from options or was input interactively
      let app_type = argv.type || values.type;
      let skeleton_dir = path.join(data.template_dir, "skeleton", app_type);
      if (argv.type && !fs.existsSync(skeleton_dir)) {
        throw new qx.tool.utils.Utils.UserError(`Application type '${argv.type}' does not exist or has not been implemented yet.`);
      }

      // copy template, replacing template vars
      function traverseFileSystem(sourceDir, targetDir) {
        let files = fs.readdirSync(sourceDir);
        for (let part of files) {
          let sourceFile = path.join(sourceDir, part);
          let stats = fs.statSync(sourceFile);
          if (stats.isFile()) {
            let targetFile = path.join(targetDir, part.replace(/\.tmpl/, ""));
            if (sourceFile.includes(".tmpl")) {
              // template file
              let template = fs.readFileSync(sourceFile, "utf-8");
              for (let var_name in values) {
                template = template.replace(new RegExp(`\\$\{${var_name}\}`, "g"), values[var_name]);
              }
              if (argv.verbose) {
                qx.tool.compiler.Console.info(`>>> Creating ${targetFile} from template ${sourceFile}...`);
              }
              // qx.tool.compiler.Console.log(template);
              if (fs.existsSync(targetFile)) {
                throw new qx.tool.utils.Utils.UserError(`${targetFile} already exists.`);
              }
              fs.writeFileSync(targetFile, template, "utf-8");
            } else {
              // normal file
              if (argv.verbose) {
                qx.tool.compiler.Console.info(`>>> Copying ${sourceFile} to ${targetFile}...`);
              }
              fs.copyFileSync(sourceFile, targetFile);
            }
          } else if (stats.isDirectory()) {
            let newTargetDir = targetDir;
            // replace "custon" with namespace, creating namespaced folders in the "class" dir, but not anywhere else
            let parts = (part === "custom") ? values.namespace.split(/\./) : [part];
            for (let part of parts) {
              newTargetDir = path.join(newTargetDir, part);
              fs.mkdirSync(newTargetDir);
            }
            traverseFileSystem(sourceFile, newTargetDir);
          }
        }
      }
      // go
      traverseFileSystem.bind(this)(skeleton_dir, appdir);
    }
  }
});
