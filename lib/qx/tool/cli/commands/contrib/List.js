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

const qx = require("qooxdoo");
const semver = require("semver");

/**
 * Lists compatible contrib libraries
 */
qx.Class.define("qxcli.commands.contrib.List", {
  extend: qxcli.commands.Contrib,

  statics: {
    getYargsCommand: function() {
      return {
        command: 'list [repository]',
        describe: 'if no repository name is given, lists all available contribs that are compatible with the project\'s qooxdoo version ("--all" lists incompatible ones as well). Otherwise, list all compatible contrib libraries.',
        builder: {
          'all': {
            alias: 'a',
            describe: 'Show all versions, including incompatible ones'
          },
          "verbose": {
            alias: 'v',
            describe: 'Verbose logging'
          }
        },
        handler: function(argv) {
          return new qxcli.commands.contrib.List(argv)
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
      let list = repos_cache.list;
      
      if ( repos_cache.list.length == 0 ){
        throw new qxcli.Utils.UserError("You need to execute 'qx contrib update' first.");
      }
      
      let qooxdoo_version = await this.getUserQxVersion();
      if(argv.verbose) console.log(`>>> qooxdoo version:  ${qooxdoo_version}`);
     
      // has a repository name been given?
      let list_repo_only = argv.repository;
      
      if( list_repo_only && ! this.getCache().repos.data[list_repo_only] ){
        throw new qxcli.Utils.UserError(`'${list_repo_only}' does not exist or is not a contrib library.`);
      }      

      // list the latest release of each library compatible with the current qooxdoo version
      let num_compat_repos = 0;
      for ( let repo_name of list) {
        
        // if a repository name has been passed, list all releases of this repo, otherwise skip
        if ( list_repo_only && repo_name !== list_repo_only ) continue;
        
        // get releases version
        let repo_data = repos_cache.data[repo_name];
        let tag_names = repo_data.releases.list;
        let { description } = repo_data;
        let releaseInfo = [];
      
        // iterate over releases, at least one of the libraries in the release needs to be compatible
        let hasCompatibleRelease = false;
        for (let tag_name of tag_names){
          let release_data = repo_data.releases.data[tag_name];
          let { prerelease, manifests } = release_data;
          let compatible_releases = [];
          // iterate over manifests in that release 
          for ( let { qx_versions, info } of manifests ){
            if( info === undefined ){ 
              if ( argv.verbose) console.warn( `!!! Undefined info field for ${repo_name}/${tag_name}`);
              continue;
            }
            let isCompatible = semver.satisfies(qooxdoo_version, qx_versions, true);
            compatible_releases.push(`  - ${info.name} ${isCompatible?'':'(incompatible, requires qooxdoo ' + qx_versions +')'}`);
            // use the latest compatible release
            if( this.getCache().compat[qooxdoo_version] === undefined ){
              this.getCache().compat[qooxdoo_version] = {};
            }
            if ( ! hasCompatibleRelease && isCompatible && ! prerelease){
              this.getCache().compat[qooxdoo_version][repo_name]=tag_name;
              hasCompatibleRelease = true;
            }
          }
          if ( compatible_releases.length)
          {
            releaseInfo.push(`  ${tag_name}${prerelease?" (prerelease)":""}:`);
            releaseInfo = releaseInfo.concat(compatible_releases);
          }
        }
        if( ! hasCompatibleRelease && ! argv.all ) continue;
        if( hasCompatibleRelease ) num_compat_repos++;
        let title = `${repo_name} ${hasCompatibleRelease?"":"(incompatible)"}`;
        let padding = " ".repeat(Math.max(50-title.length,1));
        console.info(title +  padding + description);
        if( releaseInfo.length && (argv.all || list_repo_only ) ) {
          console.info(releaseInfo.join("\n"));
        }
      }
      if ( num_compat_repos === 0 && ! argv.all ){
        let msg=''+
          `Currently, no contrib libraries with stable releases compatible with `+
          `qooxdoo version ${qooxdoo_version} exist. Try 'qx contrib list --all'.`;
        console.info(msg);
      }
      this.saveCache();
    }
  }
});
