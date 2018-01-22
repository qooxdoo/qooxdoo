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

/*global qx */

require("qooxdoo");
const fs = require("fs");
const process = require('process');
const path = require('upath');
const jsonlint = require("jsonlint");
const {promisify} = require('util');
const JsonToAst = require("json-to-ast");
const readFile = promisify(fs.readFile);

require("./../Command");

/**
 * Add a new script file to the current project, to be loaded by the qooxdoo boot loader
 *
 * Syntax: `qx add script path/to/script.js`
 * 
 */
qx.Class.define("qx.tool.cli.commands.add.Script", {
  extend: qx.tool.cli.commands.Command,
  statics: {
    getYargsCommand: function() {
      return {
        command: 'script <scriptpath> [options]',
        describe: 'adds a new script file to the current project, to be loaded before application startup.',
        builder: {
          "resourcedir" : {
            describe : "The subdirectory of the resource folder in which to place the file",
            alias : "d",
            default : "js"
          },
          "rename" : {
            describe : "Rename the file to the given name",
            alias : "r"
          },
          "undo" : {
            describe : "Removes the file that would normally be added with the given arguments",
            alias : "z"
          }          
        },
        handler: function(argv) {
          return new qx.tool.cli.commands.add.Script(argv)
            .process()
            .catch((e) => {
              console.error(e.stack || e.message);
              process.exit(1);
            });
        }
      };
    }
  },

  members: {
    process: async function() 
    {
      let script_path = this.argv.scriptpath;
      let script_name = path.basename(script_path);
      let resource_dir_path = path.join( process.cwd(), "source", "resource", this.argv.resourcedir );
      let resource_file_path = path.join( resource_dir_path, this.argv.rename || script_name );
      let external_res_path = path.join( this.argv.resourcedir, this.argv.rename || script_name );
      // validate file paths
      let manifest_path = path.join( process.cwd(), "Manifest.json" );
      if( ! await fs.existsAsync( manifest_path )){
        throw new qx.tool.cli.Utils.UserError("No Manifest.json file in this directory. Please go to the your project root.");
      }      
      if( ! script_path.endsWith(".js")){
        throw new qx.tool.cli.Utils.UserError("File doesn't seem to be a javascript file.");
      }      
      if( ! await fs.existsAsync( script_path ) && ! this.argv.undo ){
        throw new qx.tool.cli.Utils.UserError(`File does not exist: ${script_path}`);
      }
      if( await fs.existsAsync( resource_file_path ) && ! this.argv.undo ){
        throw new qx.tool.cli.Utils.UserError(`Script already exists: ${resource_file_path}`);
      }      
      // check manifest structure
      let manifest = await this.parseJsonFile(manifest_path);
      if( ! qx.lang.Type.isObject(manifest.externalResources) ){
        manifest.externalResources = {}
      }
      if( ! qx.lang.Type.isArray( manifest.externalResources.script ) ){
        manifest.externalResources.script = [];
      }
      
      let script_list = manifest.externalResources.script;
      if ( this.argv.undo ){
        // undo, i.e. remove file from resource folder and Manifest
        if( script_list.includes(external_res_path) ){
          manifest.externalResources.script = script_list.filter( elem => elem != external_res_path);
        } 
        if ( await fs.existsAsync( resource_file_path ) ){
          await fs.unlinkAsync( resource_file_path );
        }
      } else {
        // copy script to app resources and add to manifest
        if( ! await fs.existsAsync(resource_dir_path) ){
          require('mkdirp').sync( resource_dir_path, 0o755 );
        }
        await fs.copyFileAsync( script_path, resource_file_path );
        if( ! script_list.includes(external_res_path) ){
          manifest.externalResources.script.push(external_res_path);
        }        
      }
      // save      
      let manifest_content = JSON.stringify(manifest, null, 2);
      fs.writeFileSync( manifest_path, manifest_content, "utf-8");
    }
  }
});
