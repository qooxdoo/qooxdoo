/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * The Package wraps a list of related script URLs, which are required by one
 * or more parts.
 *
 * @internal
 * @ignore(qx.util.ResourceManager)
 */
qx.Bootstrap.define("qx.io.part.Package",
{
  /**
   * @param urls {String[]} A list of script URLs
   * @param id {var} Unique package hash key
   * @param loaded {Boolean?false} Whether the package is already loaded
   */
  construct : function(urls, id, loaded)
  {
    this.__readyState = loaded ? "complete" : "initialized";
    this.__urls = urls;
    this.__id = id;
  },


  members :
  {
    __readyState : null,
    __urls : null,
    __id : null,
    __closure : null,
    __loadWithClosure : null,
    __timeoutId : null,
    __notifyPackageResult : null,


    /**
     * Get the package ID.
     *
     * @return {String} The package id
     */
    getId : function() {
      return this.__id;
    },


    /**
     * Get the ready state of the package. The value is one of
     * <ul>
     * <li>
     *   <b>initialized</b>: The package is initialized. The {@link #load}
     *   method has not yet been called
     * </li>
     * <li><b>loading</b>: The package is still loading.</li>
     * <li><b>complete</b>: The package has been loaded successfully</li>
     * <li><b>cached</b>: The package is loaded but is not executed
     *   (for closure parts)</li>
     * </li>
     *
     * @return {String} The ready state.
     */
    getReadyState : function() {
      return this.__readyState;
    },


    /**
     * Returns the urlsstored stored in the package.
     *
     * @internal
     * @return {String[]} An array of urls of this package.
     */
    getUrls : function() {
      return this.__urls;
    },


    /**
     * Method for storing the closure for this package. This is only relevant
     * if a {@link qx.io.part.ClosurePart} is used.
     *
     * @param closure {Function} The code of this package wrapped in a closure.
     */
    saveClosure : function(closure)
    {
      if (this.__readyState == "error") {
        return;
      }

      this.__closure = closure;

      if (!this.__loadWithClosure) {
        this.execute();
      } else {
        clearTimeout(this.__timeoutId);
        this.__readyState = "cached";
        this.__notifyPackageResult(this);
      }
    },


    /**
     * Executes the stored closure. This is only relevant if a
     * {@link qx.io.part.ClosurePart} is used.
     */
    execute : function()
    {
      if (this.__closure)
      {
        this.__closure();
        delete this.__closure;
      }

      if (qx.$$packageData[this.__id])
      {
        this.__importPackageData(qx.$$packageData[this.__id]);
        delete qx.$$packageData[this.__id];
      }
      this.__readyState = "complete";
    },


    /**
     * Load method if the package loads a closure. This is only relevant if a
     * {@link qx.io.part.ClosurePart} is used.
     *
     * @param notifyPackageResult {Function} The callback if all scripts are
     *   done loading in this package.
     * @param self {Object?} The context of the callback.
     */
    loadClosure : function(notifyPackageResult, self)
    {
      if (this.__readyState !== "initialized") {
        return;
      }

      this.__loadWithClosure = true;

      this.__readyState = "loading";

      this.__notifyPackageResult = qx.Bootstrap.bind(notifyPackageResult, self);

      this.__loadScriptList(
        this.__urls,
        function() {},
        function() {
          this.__readyState = "error";
          notifyPackageResult.call(self, this);
        },
        this
      );

      var pkg = this;
      this.__timeoutId = setTimeout(function() {
        pkg.__readyState = "error";
        notifyPackageResult.call(self, pkg);
      }, qx.Part.TIMEOUT);
    },


    /**
     * Load the part's script URLs in the correct order.
     *
     * @param notifyPackageResult {Function} The callback if all scripts are
     *   done loading in this package.
     * @param self {Object?} The context of the callback.
     */
    load : function(notifyPackageResult, self)
    {
      if (this.__readyState !== "initialized") {
        return;
      }

      this.__loadWithClosure = false;

      this.__readyState = "loading";

      this.__loadScriptList(
        this.__urls,
        function() {
          this.__readyState = "complete";
          this.execute();
          notifyPackageResult.call(self, this);
        },
        function() {
          this.__readyState = "error";
          notifyPackageResult.call(self, this);
        },
        this
      );
    },


    /**
     * Loads a list of scripts in the correct order.
     *
     * @param urlList {String[]} List of script urls
     * @param callback {Function} Function to execute on completion
     * @param errBack {Function} Function to execute on error
     * @param self {Object?window} Context to execute the given function in
     */
    __loadScriptList : function(urlList, callback, errBack, self)
    {
      if (urlList.length == 0)
      {
        callback.call(self);
        return;
      }

      var urlsLoaded = 0;
      var self = this;
      var loadScripts = function(urls)
      {
        if (urlsLoaded >= urlList.length)
        {
          callback.call(self);
          return;
        }

        var loader = new qx.bom.request.Script();
        loader.open("GET", urls.shift());

        loader.onload = function()
        {
          urlsLoaded += 1;
          loader.dispose();

          // Important to use engine detection directly to keep the minimal
          // package size small [BUG #5068]
          if ((qx.bom.client.Engine.getName() == "webkit"))
          {
            // force asynchronous load
            // Safari fails with an "maximum recursion depth exceeded" error if it is
            // called sync.
            setTimeout(function()
            {
              loadScripts.call(self, urls, callback, self);
            }, 0);
          }
          else
          {
            loadScripts.call(self, urls, callback, self);
          }
        };

        loader.onerror = function() {
          if (self.__readyState == "loading") {
            clearTimeout(self.__timeoutId);
            loader.dispose();
            return errBack.call(self);
          }
        };

        // Force loading script asynchronously (IE may load synchronously)
        window.setTimeout(function() {
          loader.send();
        });
      };

      loadScripts(urlList.concat());
    },


    /**
     * Import the data of a package. The function is defined in the loader
     * script.
     *
     * @signature function(packageData)
     * @param packageData {Map} Map of package data categories ("resources",...)
     */
    __importPackageData : qx.$$loader.importPackageData
  }
});
