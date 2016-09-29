/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2016 Visionet GmbH, http://www.visionet.de
     2016 OETIKER+PARTNER AG, https://www.oetiker.ch

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Dietrich Streifert (level420)
     * Tobias Oetiker (oetiker)

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
 *    // in debug mode load the uncompressed unobfuscated scripts
 *    var src = '';
 *    var min = '.min';
 *    if (qx.core.Environment.get("qx.debug")) {
 *      src = '.src';
 *      min = '';
 *    }
 *
 *    // initialize the script loading
 *    var dynLoader = new qx.util.DynamicScriptLoader();
 *
 *
 *    dynLoader.addListenerOnce('ready',function(e){
 *      console.log("all scripts have been loaded!");
 *    });
 *
 *    dynLoader.addListener('failed',function(e){
 *      var data = e.getData();
 *      console.log("failed to load "+data.script);
 *    });
 *
 *    dynLoader.load([
 *        "myapp/jquery/jquery"+min+".js",
 *        "myapp/highcharts/highcharts"+src+".js",
 *        "myapp/highcharts/highcharts-more"+src+".js",
 *        "myapp/highcharts/highcharts-modifications.js"
 *    ]);
 *    
 * </code>
 */
qx.Class.define("qx.util.DynamicScriptLoader", {
  extend: qx.core.Object,

  /**
   * Initialize the state hashes if not yet done
   */

  construct: function () {
    this.base(arguments);
    this.__QUEUE = [];
    this.__LOADING = false;
  },

  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /**
     * fired when a script is loaded successfully. The data contains 'script' and 'status' keys.
     */
    loaded: 'qx.event.type.Data',

    /**
     * fired when a specific script fails loading.  The data contains 'script' and 'status' keys.
     */
    failed: 'qx.event.type.Data',

    /**
     * fired when all given scripts are loaded, each time loadScriptsDynamic is called.
     */
    ready: 'qx.event.type.Event'
  },

  statics: {
    /**
     * Map of scripts being added at the present time. Key is script name; value is instance of this class which
     * is loading it.
     */
    __IN_PROGRESS: {},
     /**
      * Map of scripts that have fully loaded. Key is script name; value is true
      */
    __LOADED: {}
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members: {

    __QUEUE: null,
    __LOADING: null,


    /**
     * Load scripts dynamically, typically used in the instance constructor
     *
     * @param codeArr {Array} an array with the uri names of the scripts
     * @param callback {Function?undefined} a callback function to call when all the scripts in the array have been loaded
     * @param context {Object?undefined} a contex for calling the callback
     *
     * @return {String|null} name of the last script to be loaded
     *     Returns the name of the last script you can expect to be loaded if all scripts are already loaded null will be returned.
     *
     */
    load: function(codeArr) {
      codeArr.forEach(function(script) {
         this.__QUEUE.push(script);
      },this);
      this.__loadScripts();
    },


    /**
     * Chain loading scripts.
     *
     * Recursively called until the array of scripts is consumed
     *
     * @param codeArr {Array} an array with the uri names of the scripts
     */
    __loadScripts: function() {
      var cl = qx.util.DynamicScriptLoader;
      var script;
      var dynLoader;
      var id1, id2;
      var uri;
      var loader;

      if (this.__LOADING === true) {
        return;
      }

      script = this.__QUEUE.shift();
      if (!script){
        this.fireEvent("ready")
        return;
      }

      if (cl.__LOADED[script]){
        this.fireDataEvent('loaded',{
          script: script,
          status: 'preloaded'
        });
        this.__loadScripts();
        return;
      }           

      this.__LOADING = true

      dynLoader = cl.__IN_PROGRESS[script];
      if (dynLoader){

          id1 = dynLoader.addListener('loaded',function(e){
            var data = e.getData();
            if (data.script === script){
              dynLoader.removeListenerById(id2);
              dynLoader.removeListenerById(id1);
              this.fireDataEvent('loaded',data);
              this.__LOADING = false;
              this.__loadScripts();
            }
          },this);

          id2 = dynLoader.addListener('failed',function(e){
            var data = e.getData();
            if (data.script === script){
              dynLoader.removeListenerById(id1);
              dynLoader.removeListenerById(id2);              
              this.fireDataEvent('failed',data);
              this.__LOADING = false;
            }
          },this);

          return;
      }

      uri = qx.util.ResourceManager.getInstance().toUri(script);
      loader = new qx.bom.request.Script();
      loader.on("load", function(request) {
        cl.__LOADED[script] = true;
        delete cl.__IN_PROGRESS[script];
        this.fireDataEvent('loaded', {
          script: script,
          status: request.status
        });
        this.__LOADING = false;
        this.__loadScripts();
      },this);

      loader.on("error", function(request) {
        this.fireDataEvent('failed', {
          script: script,
          status: request.status
        });        
        this.__LOADING = false;
      }, this);
 
      loader.on("timeout", function(request) {
        this.fireDataEvent('failed', {
          script: script,
          status: request.status
        });
        this.__LOADING = false;
      }, this);

      // this.debug("Loading " + script + " started");
      loader.open("GET", uri);
      cl.__IN_PROGRESS[script] = this;
      loader.send();
    }
  }
});
