/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2016 Visionet GmbH, http://www.visionet.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Dietrich Streifert (level420)

************************************************************************ */


/**
 * Dynamically load non qx scripts on first instance init
 *
 * Usage example:
 * 
 * <code>
 *  ... assets ...
 * /**
 *  * @asset(myapp/jquery/*)
 *  * @asset(myapp/highcharts/*)
 *  *
 *  * @ignore(jQuery.*)
 *  * @ignore(Highcharts.*)
 *  ...
 *
 *  
 *  qx.Class.define("myapp.myClass.Chart", {
 *    extend : myapp.myClass,
 *
 *    include : [
 *      qx.io.MDynamicScriptLoader
 *    ],
 * 
 *    construct : function()
 *    {
 *      this.base(arguments);
 * 
 *      // other useful contructor code here
 * 
 *      // do something usefull when all scripts are loaded
 *      this.addListener('scriptsReady', this.__onScriptsReady, this);
 *   
 *      // in debug mode load the uncompressed unobfuscated scripts
 *      var src = '';
 *      var min = '.min';
 *      if (qx.core.Environment.get("qx.debug")) {
 *        src = '.src';
 *        min = '';
 *      }
 *
 *      // initialize the script loading
 *      this._loadScriptsDynamic([
 *        "myapp/jquery/jquery"+min+".js",
 *        "myapp/highcharts/highcharts"+src+".js",
 *        "myapp/highcharts/highcharts-more"+src+".js",
 *        "myapp/highcharts/highcharts-modifications.js"
 *      ]);
 *    }
 *  });
 *      
 * </code>
 */
qx.Mixin.define("qx.io.MDynamicScriptLoader",
{
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events : {
    /**
     * fired when a specific script is loaded successfully
     */
    scriptLoadingSuccess: 'qx.event.type.Data',

    /**
     * fired when a specific script fails loading
     */
    scriptLoadingFailed: 'qx.event.type.Data',

    /**
     * fired when all given scripts are loaded, the first time all scripts reported
     * load success
     */
    scriptsLoadingComplete: 'qx.event.type.Event',
    
    /**
     * fired when all given scripts are loaded, each time loadScriptsDynamic is called
     */
    scriptsReady: 'qx.event.type.Event'
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members : {
  
    /**
     * Load scripts dynamically, typically used in the instance constructor
     * 
     * @param codeArr {Array} an array with the uri names of the scripts
     * 
     */
    _loadScriptsDynamic: function(codeArr) {
      this.__initStateHashes();      
      this.__loadScriptArr(codeArr);
    },

    
    /**
     * Initialize the state hashes if not yet done
     */
    __initStateHashes : function() {
      if(!this.constructor.__LOADING) {
        this.constructor.__LOADING = {};
      }
      if(!this.constructor.__LOADED) {
        this.constructor.__LOADED = {};
      }
    },


    /**
     * Chain loading scripts.
     * 
     * Recursively called until the array of scripts is consumed
     * 
     * @param codeArr {Array} an array with the uri names of the scripts
     */
    __loadScriptArr: function(codeArr){

      var script = codeArr.shift();

      if (script) {
        // if the script was alreay loaded, recurse to the next script
        //
        if (this.constructor.__LOADED[script] === true) {
          this.__loadScriptArr(codeArr);
        }
        // the script is currently loading, initiated by another instance
        // 
        else if (this.constructor.__LOADING[script]){
          // start again at the next script, when this script is successfully loaded by
          // the other instance
          this.constructor.__LOADING[script].addListenerOnce('scriptLoadingSuccess', function(){
            this.__loadScriptArr(codeArr);
          }, this);
        }
        // the loader was not yet started for this script
        //
        else {
          this.constructor.__LOADING[script] = this;
          
          var uri = qx.util.ResourceManager.getInstance().toUri(script);
          
          var loader = new qx.bom.request.Script();
          
          loader.on("load", function(request){
            this.constructor.__LOADING[script] = null;
            this.constructor.__LOADED[script] = true;
            
            this.fireDataEvent('scriptLoadingSuccess', {script: script, uri: uri, status: request.status});
            
            // on success recursive call for loading the next script
            this.__loadScriptArr(codeArr);
          }, this);

          loader.on("error", function(request) {
            this.constructor.__LOADING[script] = null;
            this.constructor.__LOADED[script] = false;
            
            this.fireDataEvent('scriptLoadingFailed', {script: script, uri: uri, status: request.status});
          }, this);

          loader.on("timeout", function(request) {
            this.constructor.__LOADING[script] = null;
            this.constructor.__LOADED[script] = false;
            
            this.fireDataEvent('scriptLoadingFailed', {script: script, uri: uri, status: request.status});
          }, this);
          
          loader.open("GET", uri);
          loader.send();
        }
      }
      // no more scripts in codeArr, which means that all the
      // scripts were loaded.
      else {
        // ensure that the scriptsLoaded event is only fired once
        //
        if(this.constructor.__LOADING_COMPLETE !== true) {
          this.constructor.__LOADING_COMPLETE = true;
          // this.debug("__loadScriptArr: all scripts loaded, fireing event scriptsLoadingComplete");
          this.fireEvent('scriptsLoadingComplete');
        }

        // scriptsReady event is fired for each instance
        // this.debug("__loadScriptArr: all scripts already loaded, fireing event scriptsReady");
        this.fireEvent("scriptsReady");
      }
    }
  }
});
