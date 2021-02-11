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
/**
 * Add a new class file to the current project, based on a template.
 *
 * Syntax: `qx add class <classname> [--type=template_name] [--extend=extended_class] [--import] [--from-pkg=package_name]`
 * If omitted, `--type` defaults to "default". The path to the template file will be calculated as follows:
 * 1. transform template_name to ${template_name}.tmpl.js
 * 2. check if this file exists in the "templates/class" folder
 *    a. of a package, if the --from-pkg paramater wass passed (not implemented)
 *    b. otherwise, of the current project
 *    c. finally, of the CLI library
 *
 * If the --import flag is set, copy the template to the templates/class folder of the current project,
 * so it can be customized and used instead of the one shipped with the CLI.
 *
 * If you place a file named `header.js` in the root of your project, this header will be used verbatim
 * as the ${header} template variable instead of the generic header template, which is populated with
 * information from Manifest.json
 *
 * (Package support is not yet implemented)
 *
 */
qx.Class.define("qx.tool.cli.commands.add.Class", {
  extend:qx.tool.cli.commands.Command,
  statics: {
    getYargsCommand: function() {
      return {
        command: "class <classname> [options]",
        describe: "adds a new class file to the current project, based on a template.",
        builder: {
          "type":{
            alias : "t",
            describe: "the type of the class (optional).",
            default : "default"
          },
          "extend":{
            alias : "e",
            describe: "the base class of the new class"
          },
          "import":{
            describe: "import the template to the `templates/class` folder of the current project, where it can be customized"
          },
          "force":{
            alias : "f",
            describe: "overwrite an existing file"
          }
        }
      };
    }
  },

  members: {
    process: async function() {
      let argv = this.argv;

      // read Manifest.json
      let manifestConfig = await qx.tool.config.Manifest.getInstance().load();
      let manifestData = manifestConfig.getData();

      // prepare template vars
      let values = Object.assign({}, manifestData.info, manifestData.provides);
      // @todo Add support for authors, ask interactively if author info should be taken
      // from Manifest or entered manually, then create string representation to insert.
      values.authors = "";
      values.classname = argv.classname;
      values.extend = argv.extend ? argv.extend : "qx.core.Object";

      // @todo ask interactively for copyright holder, create a setting in Manifest.json
      values.copyright = (new Date()).getFullYear();

      // check top-level namespace
      let class_namespaces = argv.classname.split(/\./);
      let manifest_namepaces = values.namespace.split(/\./);
      if (class_namespaces[0] !== manifest_namepaces[0]) {
        throw new qx.tool.utils.Utils.UserError(`Invalid top namespace '${class_namespaces[0]}'. Must be '${manifest_namepaces[0]}'.`);
      }

      // get path to the template file
      let template_name = argv.type;
      let template_path;
      let potential_dirs = [
        // 1. in the templates/class dir of the current project
        path.join(process.cwd(), "templates"),
        // 2. in the templates/class dir of cli
        this.getTemplateDir()
        // 3. @todo: in a package's templates dir
      ];
      let found = false;
      for (let dir of potential_dirs) {
        template_path = path.join(dir, "class", template_name + ".tmpl.js");
        if (await fs.existsAsync(template_path)) {
          found = true;
          break;
        }
      }
      if (!found) {
        throw new qx.tool.utils.Utils.UserError(`Template ${template_name} does not exist.`);
      }
      let template = await fs.readFileAsync(template_path, "utf-8");

      // handle header macro in the project root
      let header_template;
      let header_template_path = path.join(process.cwd(), "header.js");
      try {
        header_template = fs.readFileSync(header_template_path, "utf-8");
      } catch (e) {
        // if none exists, use header template in the same folder as the template itself
        header_template_path = path.join(path.dirname(template_path), "header.tmpl.js");
        try {
          header_template = fs.readFileSync(header_template_path, "utf-8");
        } catch (e) {}
      }
      if (header_template) {
        // replace template vars in header
        if (header_template_path.includes(".tmpl.js")) {
          for (let var_name in values) {
            header_template = header_template.replace(new RegExp(`\\$\{${var_name}\}`, "g"), values[var_name]);
          }
        }
        values.header = header_template;
      }

      // replace template vars
      let final_content = template;
      for (let var_name in values) {
        final_content = final_content.replace(new RegExp(`\\$\{${var_name}\}`, "g"), values[var_name]);
      }
      // check if file already exists
      let relative_path = path.join("source", "class", ...class_namespaces) + ".js";
      let absolute_path = path.join(process.cwd(), relative_path);
      let file_exists = false;
      try {
        fs.accessSync(absolute_path);
        file_exists = true;
      } catch (e) {}
      if (file_exists && !argv.force) {
        throw new qx.tool.utils.Utils.UserError(`Class file ${relative_path} already exists. Use --force to overwrite it`);
      }


      // write out new class file
      try {
        require("mkdirp").sync(path.dirname(absolute_path), 0o755);
        await fs.writeFileAsync(absolute_path, final_content, "utf-8");
      } catch (e) {
        throw new qx.tool.utils.Utils.UserError(`Cannot write to ${absolute_path}: ${e.message}`);
      }

      // import
      if (argv.import) {
        let local_templates_path = path.join(process.cwd(), "templates", "class");
        let local_copy_path = path.join(local_templates_path, path.basename(template_path));
        try {
          require("mkdirp").sync(local_templates_path, 0o755);
          await fs.writeFileAsync(local_copy_path, template, "utf-8");
        } catch (e) {
          throw new qx.tool.utils.Utils.UserError(`Cannot copy template to ${local_templates_path}: ${e.message}`);
        }
      }
    }
  }
});
