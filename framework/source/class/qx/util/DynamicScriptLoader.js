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
 * Dynamically load non qx scripts. This class is aware of all scripts that have
 * been loaded using its instances, so if two instances load jquery, it will only
 * be loaded once, and the second instance will wait for the jquery to be loaded
 * before continuing to load additional scripts.
 *
 * Usage example:
 *
 * <pre>
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
 *    var dynLoader = new qx.util.DynamicScriptLoader([
 *        "myapp/jquery/jquery"+min+".js",
 *        "myapp/highcharts/highcharts"+src+".js",
 *        "myapp/highcharts/highcharts-more"+src+".js",
 *        "myapp/highcharts/highcharts-modifications.js"
 *    ]);
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
 *    dynLoader.start();
 *    
 * </pre>
 */
qx.Class.define("qx.util.DynamicScriptLoader", {
  extend: qx.core.Object,

  /**
   * Create a loader for the given scripts.
   *
   * @param scriptArr {Array|String} the uri name(s) of the script(s) to load 
   */

  construct: function (scriptArr) {
    this.base(arguments);
    this.__started = false;
    this.__QUEUE = (qx.lang.Type.isString(scriptArr)
                ? [ scriptArr ]
                : qx.lang.Array.clone(scriptArr));
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

    /**
     * Array of the scripts to be loaded
     */
    __QUEUE: null,

    /**
     * True if start has been called.
     */
    __started: null,



    /**
     * Start loading scripts. This may only be called once!
     * @return {Promise} a promise which will be resolved after load of all scripts.
     */
    start: function() {
      return new qx.Promise(function(resolve, reject) {
        this.addListenerOnce("ready", resolve, this);
        this.addListenerOnce("failed", function(e) {
          reject(new Error(e.getData()));
        }, this);
        if (this.isDisposed()) {
          reject(new Error('disposed'));
        }
        if (this.__started){
          reject(new Error('you can only call start once per instance'));
        }
        this.__started = true;
        this.__loadScripts();
      }, this);
    },


    /**
     * Chain loading scripts.
     *
     * Recursively called until the array of scripts is consumed
     *
     */
    __loadScripts: function () {
      var DynamicScriptLoader = qx.util.DynamicScriptLoader;
      var script;
      var dynLoader;
      var id1, id2;
      var uri;
      var loader;

      script = this.__QUEUE.shift();
      if (!script){
        this.fireEvent("ready")
        return;
      }

      if (DynamicScriptLoader.__LOADED[script]){
        this.fireDataEvent('loaded',{
          script: script,
          status: 'preloaded'
        });
        this.__loadScripts();
        return;
      }           

      dynLoader = DynamicScriptLoader.__IN_PROGRESS[script];
      if (dynLoader){

          id1 = dynLoader.addListener('loaded',function (e) {
            if (this.isDisposed()) {
              return;
            }
            var data = e.getData();
            if (data.script === script){
              dynLoader.removeListenerById(id2);
              dynLoader.removeListenerById(id1);
              this.fireDataEvent('loaded',data);
              this.__loadScripts();
            }
          },this);

          id2 = dynLoader.addListener('failed',function (e) {
            if (this.isDisposed()) {
              return;
            }
            var data = e.getData();
            dynLoader.removeListenerById(id1);
            dynLoader.removeListenerById(id2);              
            this.fireDataEvent('failed',{
              script: script,
              status: 'loading of ' + data.script + ' failed while waiting for ' + script
            });
          },this);

          return;
      }

      uri = qx.util.ResourceManager.getInstance().toUri(script);

      loader = new qx.bom.request.Script();

      loader.on("load", function(request) {
        if (this.isDisposed()) {
           return;
        }
        DynamicScriptLoader.__LOADED[script] = true;
        delete DynamicScriptLoader.__IN_PROGRESS[script];
        this.fireDataEvent('loaded', {
          script: script,
          status: request.status
        });
        this.__loadScripts();
      },this);

      var onError = function(request) {
        if (this.isDisposed()) {
           return;
        }
        delete DynamicScriptLoader.__IN_PROGRESS[script];
        this.fireDataEvent('failed', {
          script: script,
          status: request.status
        });
      };

      loader.on("error", onError,this);
      loader.on("timeout", onError,this);

      // this.debug("Loading " + script + " started");
      loader.open("GET", uri);
      DynamicScriptLoader.__IN_PROGRESS[script] = this;
      loader.send();
    }
  },
  destruct : function() {
    var DynamicScriptLoader = qx.util.DynamicScriptLoader;
    for (var key in DynamicScriptLoader.__IN_PROGRESS){
      if (DynamicScriptLoader.__IN_PROGRESS[key] === this) {
        delete DynamicScriptLoader.__IN_PROGRESS[key];
      }
    }
    this.__QUEUE = undefined;
  }
});
