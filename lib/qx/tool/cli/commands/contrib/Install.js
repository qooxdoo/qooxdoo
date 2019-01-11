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
        command: 'install [contrib_uri]',
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

      if ( repos_cache.list.length === 0 ){
        if (!this.argv.quiet) {
          console.info(">>> Updating cache...");
        }
        this.clearCache();
        // implicit update
        await (new qx.tool.cli.commands.contrib.Update({quiet:true})).process();
        await (new qx.tool.cli.commands.contrib.List({quiet:true})).process();
        repos_cache = this.getCache().repos;
      }

      if (!argv.contrib_uri) {
        await this.__loadFromContribJson();
        return;
      }
   
      let qooxdoo_version = await this.getUserQxVersion();
      if(argv.verbose) console.info(`>>> qooxdoo version:  ${qooxdoo_version}`);
     
      // has a contrib_uri name been given?
      if (!argv.contrib_uri) {
        throw new qx.tool.cli.Utils.UserError("No contrib resource identifier given");
      }
      // currently, the contrib uri is github_username/repo_name[/path/to/repo].
      let parts = argv.contrib_uri.split(/\//);
      let repo_name = parts.slice(0,2).join('/');
      let contrib_path = parts.length > 2 ? parts.slice(2).join('/') : "";
      if( ! this.getCache().repos.data[repo_name] ){
        throw new qx.tool.cli.Utils.UserError(`A contrib repository '${repo_name}' cannot be found.`);
      }
      // get compatible tag name unless a release name has been given
      let tag_name = argv.release;
      if ( ! tag_name ){
        if ( this.getCache().compat[qooxdoo_version] === undefined ){
          if (!this.argv.quiet) {
            console.info(">>> Updating cache...");
          }
          await (new qx.tool.cli.commands.contrib.List({quiet:true})).process();
          // reload cache from disk
          this.getCache(true);          
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
      let found = false;
      for( let { info, path:filename } of release_data.manifests ) {
        let current_download_path = download_path;

        if (contrib_path) {
          // if a path component exists, only install the contrib in this path
          if (path.dirname(filename) !== contrib_path) continue;
          current_download_path = path.join(download_path, contrib_path);
        } else if (path.dirname(filename) !== ".") {
          // else, skip if no manifest exists in the root of the repo
          continue;
        }
        found = true;
        // does the contrib_uri name already exist?
        let index = data.libraries.findIndex((elem)=>{
          if (elem.uri) {
            return elem.uri === argv.contrib_uri;
          }
          // backwards-compatibility, can eventually be removed:
          return elem.repo_name === repo_name
            && elem.library_name === info.name;
        });
        library_elem = {
          library_name : info.name,
          library_version : info.version,
          uri : argv.contrib_uri,
          repo_name, // todo: should eventually be removed in favor of a uri-only resolution
          repo_tag : tag_name, // todo: replace by real version string
          path : path.relative(process.cwd(), current_download_path)
        };
        if (index >= 0) {
          data.libraries[index]=library_elem;
          if (! argv.quiet) console.info(`>>> Updating already existing config.json entry for'${argv.contrib_uri}'.`);
        } else {
          data.libraries.push(library_elem);
        }
        if (!this.argv.quiet){
          console.info(`>>> Installed ${info.name} (${argv.contrib_uri}, ${info.version})`);
        }
      }
      if (!found) {
        throw new qx.tool.cli.Utils.UserError(`The contrib library identified by '${argv.contrib_uri}' could not be found.`);
      }
      await fs.writeFileAsync(this.getContribFileName(), JSON.stringify(data, null, 2), "utf-8");
      await this.installApplication(argv.contrib_uri);
      if (argv.verbose) console.info(">>> Done.");
    },
    
    installApplication: async function(uri) {
      let contribJson = await this.getContribData();
      let libraryJson = contribJson.libraries.find(data => data.uri === uri);
      if (!libraryJson)
        throw new Error("Contrib with identifier '" + uri + "' is not installed.");
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
          return manifestApp.name === app.name;
        return manifestApp["class"] === app["class"];
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

    __loadFromContribJson: async function() {
      // read libraries array from contrib.json 
      let contrib_json_path = process.cwd() + "/contrib.json";
      let data = fs.existsSync(contrib_json_path) ? jsonlint.parse( fs.readFileSync(contrib_json_path,"utf-8") ) : { libraries : [ ] };
      for (let i = 0; i < data.libraries.length; i++) {
         await this.__download(data.libraries[i].repo_name, data.libraries[i].repo_tag);  
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
      if (! repo_data){
        throw new qx.tool.cli.Utils.UserError(`A contrib repository '${repo_name}' cannot be found.`);
      }
      let release_data = repo_data.releases.data[tag_name];
      if (! release_data){
        throw new qx.tool.cli.Utils.UserError(`'${repo_name}' has no release '${tag_name}'.`);
      }
      // download zip of release
      let url = release_data.zip_url;
      let contrib_dir = [process.cwd(), "contrib", repo_name.replace(/\//g,"_")+"_"+tag_name ];
      let dir_exists;
      let download_path = contrib_dir.reduce((prev,current)=>{
        let dir = prev + path.sep + current;
        if( ! fs.existsSync(dir) ){
          fs.mkdirSync(dir);
          dir_exists = false;
        } else {
          dir_exists = true;
        }
        return dir;
      });
      if (dir_exists){
        if (this.argv.verbose) console.info(`>>> Contrib repository '${repo_name}' has already been downloaded to ${download_path}. To download again, execute 'qx clean'.`);
      } else {
        if (this.argv.verbose) console.info(`>>> Downloading contrib repository '${repo_name}' from ${url} to ${download_path}`);
        try {
          await download(url, download_path, {extract:true, strip: 1});
        } catch (e) {
          throw e;
        }
      }
      return { release_data, download_path };
    }
  }
});
