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
 *    var callback = function(){
 *        console.log("Got it");
 *    };
 *    // initialize the script loading
 *    var dynLoader = qx.io.DynamicScriptLoader.getInstance();
 *
 *
 *    var readyId = dynLoader.addListenerOnce('ready',function(e){
 *      console.log("all scripts have been loaded!");
 *    });

 *    dynLoader.addListener('failed',function(e){
 *      var data = e.getData();
 *      dynLoader.removeListenerById(readyId);
 *      console.log("failed to load "+data.script);
 *    });
 *
 *    var lastScript = dynLoader.load([
 *        "myapp/jquery/jquery"+min+".js",
 *        "myapp/highcharts/highcharts"+src+".js",
 *        "myapp/highcharts/highcharts-more"+src+".js",
 *        "myapp/highcharts/highcharts-modifications.js"
 *    ],callback,this);
 *
 *    if (lastScript === null){
 *      var loadId = loader.addListener('loaded',function(e){
 *        var data = e.getData();
 *        if (data.script == lastScript){
 *          console.log('Last Script Loaded');
 *          dynLoader.removeListenerById(loadId);
 *        }
 *      }, this);
 *    }
 *    else {
 *      console.log('Scripts have already been loaded');
 *    }
 * </code>
 */
qx.Class.define("qx.io.DynamicScriptLoader", {
  extend: qx.core.Object,

  type: "singleton",

  /**
   * Initialize the state hashes if not yet done
   */

  construct: function () {
    this.base(arguments);
    this.__ADDED = {};
    this.__LOADED = {};
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
     * fired when a specific script is loaded successfully
     */
    loaded: 'qx.event.type.Data',

    /**
     * fired when a specific script fails loading
     */
    failed: 'qx.event.type.Data',

    /**
     * fired when all given scripts are loaded, each time loadScriptsDynamic is called
     */
    ready: 'qx.event.type.Event'
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members: {

    __ADDED: null,
    __LOADED: null,
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
    load: function(codeArr, callback, context) {
      var lastScript = null;
      codeArr.forEach(function(script) {
        if (this.__ADDED[script] !== true) {
          this.__QUEUE.push(script);
          this.__ADDED[script] = true;
        }
        if (.this.__LOADED[script] !== true) {
          lastScript = script;
        }
      }, this);
      if (callback) {
        var cb = new qx.util.DeferredCall(callback, context);
        if (lastScript !== null) {
          var id = this.addListener('loaded', function(e) {
            var data = e.getData();
            // this.debug("Loading " + data.script + " completed");
            if (data.script == lastScript) {
              this.removeListenerById(id);
              cb.schedule();
            }
          }, this);
        }
        else {
          cb.schedule();
        }
      }
      this.__loadScripts();
      return lastScript;
    },


    /**
     * Chain loading scripts.
     *
     * Recursively called until the array of scripts is consumed
     *
     * @param codeArr {Array} an array with the uri names of the scripts
     */
    __loadScripts: function() {

      if (this.__LOADING === true) {
        return;
      }

      var script = this.__QUEUE.shift();

      if (script) {
        this.__LOADING = true;
        var uri = qx.util.ResourceManager.getInstance().toUri(script);

        var loader = new qx.bom.request.Script();

        loader.on("load", function(request) {
          this.__LOADED[script] = true;
          this.__LOADING = false;
          this.fireDataEvent('loaded', {
            script: script,
            uri: uri,
            status: request.status
          });
          // start the next load event after the current thread has ended
          var call = new qx.util.DeferredCall(this.__loadScripts, this);
          call.schedule();
        }, this);

        loader.on("error", function(request) {
          this.__LOADING = false;
          this.fireDataEvent('failed', {
            script: script,
            uri: uri,
            status: request.status
          });
        }, this);

        loader.on("timeout", function(request) {
          this.__LOADING = false;
          this.fireDataEvent('failed', {
            script: script,
            uri: uri,
            status: request.status
          });
        }, this);
        // this.debug("Loading " + script + " started");
        loader.open("GET", uri);
        loader.send();
      }
      // no more scripts in codeArr, which means that all the
      // scripts were loaded.
      else {
        // even when we 'fall through' make sure the event gets fired AFTER the current
        // code is done.
        var ready = new qx.util.DeferredCall(function(){this.fireEvent("ready")},this);
        ready.schedule();
      }
    }
  }
});
