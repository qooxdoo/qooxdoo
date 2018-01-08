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

require("./Command");

const qx = require("qooxdoo");
const fs = require('fs');
const path = require('upath');
const process = require('process');
const jsonlint = require("jsonlint");

/**
 * Handles contrib libraries
 */
qx.Class.define("qxcli.commands.Contrib", {
  extend: qxcli.commands.Command,
  
  statics: {
    
    getYargsCommand: function() {
      return {
        command : "contrib <command> [options]",
        desc : "manages qooxdoo contrib libraries",
        builder : function (yargs) { 
          return yargs 
            .commandDir('../../../commands/contrib_commands') 
            .demandCommand() 
            .showHelpOnFail() 
        }, 
        handler : function(argv){
        }
      }
    }
  }, 
  
  members: {
  
    /**
     * The current cache object
     */
    __cache : null,
    
    /**
     * Returns the absolute path to the contrib.json file
     * @return {String}
     */
    getContribFileName: function () {
       return path.join(process.cwd(), "contrib.json");
    },

    /**
     * Returns the library list from the contrib file
     * @return {Object}
     */
    getContribData: function() {
      let contrib_json_path = this.getContribFileName();
      let data = fs.existsSync(contrib_json_path) ?
         jsonlint.parse( fs.readFileSync(contrib_json_path,"utf-8") ) :
         { libraries : [ ] };
      return data;   
    },
    /**
     * Returns the absolute path to the file that persists the cache object
     * @return {String}
     */
    getCachePath : function(){
      return path.dirname(__dirname) + "/.contrib-cache.json";
    },

    /**
     * Returns the URL of the cache data in the qx-contrib repository
     * @return {String}
     */
    getRepositoryCacheUrl : function(){
      return "https://raw.githubusercontent.com/qooxdoo/qx-contrib/master/cache.json";
    },
    
    /**
     * Returns the cache object, retrieving it from a local file if necessary
     * @return {Object}
     */
    getCache : function(){
      if ( this.__cache && typeof this.__cache == "object"){
        return this.__cache;
      }
      try {
        this.__cache = jsonlint.parse(fs.readFileSync(this.getCachePath(),"UTF-8"));
      } catch(e) {
        this.__cache = {
          repos : {
            list : [],
            data : {}
          },
          compat : {}
        };
      }
      return this.__cache;
    },

    /**
     * Manually overwrite the cache data
     * @param data {Object}
     * @return {void}
     */
    setCache : function(data){
      this.__cache = data;
    },
    
    /**
     * Saves the cache to a hidden local file
     * @return {void}
     */
    saveCache : function(){
      fs.writeFileSync(this.getCachePath(), JSON.stringify(this.__cache,null,2),"UTF-8");
    },
    
    /**
     * Exports the cache to an external file. Note that the structure of the cache
     * data can change any time. Do not build anything on it. You have been warned.
     * @param path {String}
     * @return {void}
     */
    exportCache : function(path){
      try{
        fs.writeFileSync(path, JSON.stringify(this.__cache,null,2),"UTF-8");  
      } catch (e) {
        console.error( `Error exporting cache to ${path}:` + e.message);
      }
    },
    
    /**
     * Clears the cache
     */
    clearCache : function(){
      this.__cache = null;
      try{
        fs.unlinkSync(this.getCachePath());
      } catch(e){}
    }
  }
});