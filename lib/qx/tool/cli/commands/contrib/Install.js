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

/*global qxcli*/

require("../Contrib");

require("qooxdoo");
const download = require('download');
const fs = qx.tool.compiler.utils.Promisify.fs;
const path = require('upath');
const process = require('process');
const jsonlint = require("jsonlint");

/**
 * Installs a contrib libraries
 */
qx.Class.define("qx.tool.cli.commands.contrib.Install", {
  extend: qx.tool.cli.commands.Contrib,

  statics: {
    getYargsCommand: function() {
      return {
        command: 'install [repository]',
        describe: 'installs the latest compatible release of a contrib library (as per Manifest.json). Use "-r <release tag>" to install a particular release.',
        builder: {
          "release" : {
            alias: 'r',
            describe: 'use a specific release tag instead of the tag of the latest compatible release',
            nargs: 1,
            requiresArg: true,
            type: "string" 
          },
          "verbose": {
            alias: 'v',
            describe: 'Verbose logging'
          },
          'quiet': {
            alias: 'q',
            describe: 'No output'
          }
        },
        handler: function(argv) {
          return new qx.tool.cli.commands.contrib.Install(argv)
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

    /**
     * Lists contrib libraries compatible with the current project
     */
    process: async function() {
  
      let argv = this.argv;
      let repos_cache = this.getCache().repos;

      if ( repos_cache.list.length == 0 ){
        throw new qx.tool.cli.Utils.UserError("You need to execute 'qx contrib update' first.");
      }

      if (!argv.repository) {
        this.__loadFromContrib();
        return;
      }
   
      let qooxdoo_version = await this.getUserQxVersion();
      if(argv.verbose) console.log(`>>> qooxdoo version:  ${qooxdoo_version}`);
     
      // has a repository name been given?
      if (!argv.repository) {
        throw new qx.tool.cli.Utils.UserError("No repo name given");
      }
      let repo_name = argv.repository;
      if( ! this.getCache().repos.data[repo_name] ){
        throw new qx.tool.cli.Utils.UserError(`'${repo_name}' does not exist or is not a contrib library.`);
      }
      // get compatible tag name unless a release name has been given
      let tag_name = argv.release;
      if ( ! tag_name ){
        if ( this.getCache().compat[qooxdoo_version] === undefined ){
          throw new qx.tool.cli.Utils.UserError("You need to execute 'qx contrib list' first.");
        }      
        tag_name = this.getCache().compat[qooxdoo_version][repo_name];
        if ( ! tag_name ){
          throw new qx.tool.cli.Utils.UserError(`'${repo_name}' has no stable release compatible with qooxdoo version ${qooxdoo_version}.`);
        }           
      }

      let { release_data, download_path } = await this.__download(repo_name, tag_name);

      // read libraries array from contrib.json
      let data = await this.getContribData();

      // iterate over contained libraries
      let library_elem = null;
      for( let { info, path:filename } of release_data.manifests ) {
        // does the repository name already exist?
        let index = data.libraries.findIndex((elem)=>{
          return elem.repo_name == repo_name 
            && elem.library_name == info.name;
        });
        library_elem = {
          library_name : info.name,
          library_version : info.version,
          repo_name : repo_name,
          repo_tag : tag_name,
          path : path.relative(process.cwd(), path.join(download_path, path.dirname(filename)))
        };
        if( index >= 0 ){
          data.libraries[index]=library_elem;
          if (! argv.quiet) console.info(`Updating already existing config.json entry '${info.name}'.`);
        } else {
          data.libraries.push(library_elem);
        }
      }
      await fs.writeFileAsync(this.getContribFileName(), JSON.stringify(data, null, 2), "utf-8");
      await this.installApplication(repo_name);
      if (argv.verbose) 
        console.info(">>> Done.");
      return 
    },
    
    installApplication: async function(repoName) {
      let contribJson = await this.getContribData();
      let libraryJson = contribJson.libraries.find(data => data.repo_name == repoName);
      if (!libraryJson)
        throw new Error("Repo for " + repoName + " is not installed as a contrib");
      
      let manifest = await qx.tool.compiler.utils.Json.loadJsonAsync(path.join(libraryJson.path, "Manifest.json"), "utf8");
      if (!manifest.provides || !manifest.provides.application) {
        if (this.argv.verbose) 
          console.info(">>> No application to install.");
        return;
      }
      
      let compileJson = await qx.tool.compiler.utils.Json.loadJsonAsync("compile.json");
      let manifestApp = manifest.provides.application;
      let app = compileJson.applications.find(app => {
        if (manifestApp.name && app.name)
          return manifestApp.name == app.name;
        return manifestApp["class"] == app["class"];
      });
      if (!app) {
        compileJson.applications.push(manifestApp);
        app = manifestApp;
      } else {
        for (let key in manifestApp)
          app[key] = manifestApp[key];
      }
      if (this.argv.verbose) 
        console.info(">>> Installed application " + (app.name||app["class"]));
      
      return await qx.tool.compiler.utils.Json.saveJsonAsync("compile.json", compileJson);
    },

    __loadFromContrib: async function() {
      // read libraries array from contrib.json 
      let contrib_json_path = process.cwd() + "/contrib.json";
      let data = fs.existsSync(contrib_json_path) ? jsonlint.parse( fs.readFileSync(contrib_json_path,"utf-8") ) : { libraries : [ ] };
      for (let i = 0; i < data.libraries.length; i++) {
         this.__download(data.libraries[i].repo_name, data.libraries[i].repo_tag);  
      }
    },

    /**
     * Downloads a release
     * @param {String} repo_name
     * @param {String} tag_name
     * @return {Object} A map containing {release_data, download_path}
     */
    __download: async function(repo_name, tag_name) {
      // get release data
      let repo_data = this.getCache().repos.data[repo_name];
      let release_data = repo_data.releases.data[tag_name];
      if( ! release_data ){
        throw new qx.tool.cli.Utils.UserError(`'${repo_name}' has no release '${tag_name}'.`);
      }
      console.info(`Installing ${repo_name} ${tag_name}`);
      // download zip of release
      let url = release_data.zip_url;
      let contrib_dir = [process.cwd(), "contrib", repo_name.replace(/\//g,"_")+"_"+tag_name ];
      let download_path = contrib_dir.reduce((prev,current)=>{
        let dir = prev + path.sep + current;
        if( ! fs.existsSync(dir) ) fs.mkdirSync(dir);
        return dir;
      });
      if (this.argv.verbose) console.log(`>>> Downloading ZIP from ${url} to ${download_path}`);
      try {
        await download(url, download_path, {extract:true, strip: 1});
      } catch (e) {
        throw e;
      }
      return { release_data, download_path };
    }
  }
});
