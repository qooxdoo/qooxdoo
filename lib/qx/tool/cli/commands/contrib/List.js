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
const semver = require("semver");
const columnify = require("columnify");

/**
 * Lists compatible contrib libraries
 */
qx.Class.define("qx.tool.cli.commands.contrib.List", {
  extend: qx.tool.cli.commands.Contrib,
  statics: {
    getYargsCommand: function() {
      return {
        command: "list [repository]",
        describe:
          'if no repository name is given, lists all available contribs that are compatible with the project\'s qooxdoo version ("--all" lists incompatible ones as well). Otherwise, list all compatible contrib libraries.',
        builder: {
          all: {
            alias: "a",
            describe: "Show all versions, including incompatible ones"
          },
          verbose: {
            alias: "v",
            describe: "Verbose logging"
          },
          quiet: {
            alias: 'q',
            describe: 'No output'
          }
        },
        handler: function(argv) {
          return new qx.tool.cli.commands.contrib.List(argv)
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
     * Lists contrib libraries compatible with the current project
     */
    process: async function() 
    {
      let repos_cache = this.getCache().repos;

      // implicit qx contrib update
      if ( repos_cache.list.length === 0 ) {
        await (new qx.tool.cli.commands.contrib.Update({})).process();
      }

      let qooxdoo_version = await this.getUserQxVersion();
      let num_compat_repos = await this.__createIndexes(qooxdoo_version);
      if (this.argv.verbose) {
        console.log(`>>> We have ${num_compat_repos} contrib repositories which contain libraries compatible with qooxdoo version ${qooxdoo_version}`);
      }

      if ( num_compat_repos === 0 && ! this.argv.all ) {
        console.info(
          `Currently, no contrib libraries with releases compatible with qooxdoo version ${qooxdoo_version} exist.`
        );
        return; 
      }

      // detailed repo information
      let repo = this.argv.repository;
      if ( repo ){
        if ( ! repos_cache.list.includes(repo) ){
          throw new qx.tool.cli.Utils.UserError(
            `Repository ${repo} does not exist or is not a qooxdoo contrib repo.`
          );
        }
        if( this.__libraries[repo] && this.__libraries[repo].length ){
          let columnify_options = {
            columnSplitter: '   ',
            config: {
              description: { maxWidth: 60 },
              compatibility : {
                dataTransform: function(data) {
                  switch( data ){
                    case "false" : return "not compatible / untested";
                    case "true"  : return "√";
                  }
                }
              }
            }
          }           
          console.info(columnify( this.__libraries[repo], columnify_options ) );
        } else if( this.argv.verbose ) {
          console.info(`Repository ${repo} does not contain suitable contrib libraries.`);
        }
        return;
      } 

      // list output 
      let columnify_options = {
        columnSplitter: '   ',
        config: {
          description: { maxWidth: 60 },
          installedVersion: {
            headingTransform : heading => "INSTALLED",
            dataTransform: data => data == "false" ? "" : data
          },          
          latestVersion: {
            headingTransform : heading => "LATEST",
            dataTransform: data => data == "false" ? "-" : data
          },
          latestCompatible : {
            headingTransform : heading => "COMPATIBLE",
            dataTransform: data => data == "false" ? "-" : data
          }
        }
      } 
      let list = 
        this.argv.all ?
        this.__repositories :
        this.__repositories.filter( item => item.latestCompatible );
      list.sort((l, r) => {
        l = l.name.toLowerCase();
        r = r.name.toLowerCase();
        return l < r ? -1 : l > r ? 1 : 0;
      });

      console.info( columnify( list, columnify_options ));
      console.info();
      console.info( "Note on columns: LATEST: Latest release that can be installed with this CLI;" ); 
      console.info( "                 COMPATIBLE: Latest release that is semver-compatible with the qooxdoo version used.");
      if( ! this.argv.all ){
        console.info( "To see all libraries, including potentially incompatible ones, use 'qx contrib list --all'.");  
      }
      
      // save to cache
      this.getCache().compat[qooxdoo_version] = this.__latestCompatible[qooxdoo_version];
      await this.saveCache();      
    },

    /**
     * compatibility indexes
     */
    __repositories : [],
    __libraries : {},
    __latestCompatible : {},

    /**
     * Create compatibilty indexes of repositories and the contained libraries
     * @param qooxdoo_version {String} The qooxdoo version to check compatibiity with
     * @return {Number} The number of contrib repositories containing compatible libraries
     */
    __createIndexes : async function(qooxdoo_version)
    {
      let repos_cache = this.getCache().repos;
      let num_compat_repos = 0;
      let result_repo_list = [];
      if (this.__latestCompatible[qooxdoo_version] === undefined) {
        this.__latestCompatible[qooxdoo_version] = {};
      } 

      // iterate over repositories
      for (let repo_name of repos_cache.list) {
        let repo_data = repos_cache.data[repo_name];
        let tag_names = repo_data.releases.list;
        let { description } = repo_data;
        let releaseInfo = [];
        let hasCompatibleRelease = false;
        let latestVersion = false; 
        let installedVersion = false; 
        
        // iterate over releases
        for (let tag_name of tag_names) {
          let release_data = repo_data.releases.data[tag_name];
          let { prerelease, manifests } = release_data;
          let compatible_libraries = [];

          // iterate over library manifests in that release
          for ( let { qx_versions, info } of manifests) {
            if (info === undefined) {
              if (this.argv.verbose) {
                console.warn(`>>> Ignoring ${repo_name} ${tag_name}: Undefined info field. `);
              }
              continue;
            }
            
            // library version MUST match tag name
            let name = info.name;
            let version = info.version;
            let tag_version = tag_name.replace(/v/,'');
            if( version != tag_version ){
              if (this.argv.verbose) {
                console.warn(`>>> Ignoring ${repo_name} ${tag_name}, library '${name}': mismatch between tag version '${tag_version}' and library version '${version}'.`);
              }
              continue;            
            }

            // save latest version
            try{
              if ( ! latestVersion || semver.gt( version, latestVersion, true ) ){
                latestVersion = tag_name; 
              }
            } catch(e){
              if (this.argv.verbose) {
                console.warn(`>>> Ignoring ${repo_name} ${tag_name}, library '${name}': invalid version format '${version}'.`);
              }              
            }
            

            // installed?
            let installed = await this.getInstalledTagName( repo_name, name );
            if( installed ) {
              installedVersion = installed;
            }

            // check compatibility of library
            let compatibility = semver.satisfies(
              qooxdoo_version,
              qx_versions,
              true
            );

            // prepare indexes
            if (this.__libraries[repo_name] === undefined) {
              this.__libraries[repo_name] = [];
            }   
          
            // use the latest compatible release, i.e the one that satisfies the following conditions:
            // 1) must be semver-compatible with the qooxdoo version
            // 2) must be the higher than any other version found so far
            // 3) should not be a pre-release unless there are no other compatible releases
            let latestCompatibleRelease = this.__latestCompatible[qooxdoo_version][repo_name];
            let latestCompatibleVersion = latestCompatibleRelease ? latestCompatibleRelease.replace(/v/,'') : undefined;
            if ( compatibility === true && 
              ( latestCompatibleRelease === undefined || 
                ( semver.gt( tag_version, latestCompatibleVersion, false ) && ! prerelease ) 
              )
            ) {
              this.__latestCompatible[qooxdoo_version][repo_name] = tag_name;
              hasCompatibleRelease = true;
            }

            // save data 
            this.__libraries[repo_name].push({
              name: info.name,
              version,
              compatibility,
              requires: qx_versions
            });          
          }
        }
        if (hasCompatibleRelease) num_compat_repos++;

        // add to list
        
        this.__repositories.push({
          name: repo_name,
          description,
          installedVersion,
          latestVersion,
          latestCompatible : hasCompatibleRelease ? this.__latestCompatible[qooxdoo_version][repo_name] : false 
        });
      }
      return num_compat_repos;
    }
  }
});
