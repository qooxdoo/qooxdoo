/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * The part loader knows about all generated packages and parts.
 *
 * It contains functionality to load parts.
 */
qx.Bootstrap.define("qx.Part",
{
  // !! Careful when editing this file. Do not extend the dependencies !!

  /**
   * @param loader {Object} The data structure from the boot script about all
   *   known parts and packages. Usually <code>qx.$$loader</code>.
   */
  construct : function(loader)
  {
    // assert: boot part has a single package
    var bootPackageKey = loader.parts[loader.boot][0];

    this.__loader = loader;

    // initialize the pseudo event listener maps
    this.__partListners = {};
    this.__packageListeners = {};
    this.__packageClosureListeners = {};

    // create the packages
    this.__packages = {};
    for (var key in loader.packages)
    {
      var pkg = new qx.io.part.Package(
        this.__decodeUris(loader.packages[key].uris), key, key==bootPackageKey
      );
      this.__packages[key] = pkg;
    };

    // create the parts
    this.__parts = {};
    var parts = loader.parts;
    var closureParts = loader.closureParts || {};

    for (var name in parts)
    {
      var pkgKeys = parts[name];
      var packages = [];
      for (var i = 0; i < pkgKeys.length; i++) {
        packages.push(this.__packages[pkgKeys[i]]);
      }

      // check for closure loading
      if (closureParts[name]) {
        var part = new qx.io.part.ClosurePart(name, packages, this);
      } else {
        var part = new qx.io.part.Part(name, packages, this);
      }

      this.__parts[name] = part;
    }
  },


  statics :
  {
    /**
     * Default timeout in ms for the error handling of the closure loading.
     */
    TIMEOUT : 7500,


    /**
     * Get the default part loader instance
     *
     * @return {qx.Part} the default part loader
     */
    getInstance : function()
    {
      if (!this.$$instance) {
        this.$$instance = new this(qx.$$loader);
      }
      return this.$$instance;
    },


    /**
     * Loads one or more parts asynchronously. The callback is called after all
     * parts and their dependencies are fully loaded. If the parts are already
     * loaded the callback is called immediately.
     *
     * @param partNames {String[]} List of parts names to load as defined in the
     *    config file at compile time.
     * @param callback {Function} Function to execute on completion
     * @param self {Object?window} Context to execute the given function in
     */
    require : function(partNames, callback, self) {
      this.getInstance().require(partNames, callback, self);
    },


    /**
     * Preloads one or more closure parts but does not execute them. This means
     * the closure (the whole code of the part) is already loaded but not
     * executed so you can't use the classes in the the part after a preload.
     * If you want to execute them, just use the regular {@link #require}
     * function.
     *
     * @param partNames {String[]} List of parts names to preload as defined
     *   in the config file at compile time.
     */
    preload : function(partNames) {
      this.getInstance().preload(partNames);
    },


    /**
     * Loaded closure packages have to call this method to indicate
     * successful loading and to get their closure stored.
     *
     * @param id {String} The id of the package.
     * @param closure {Function} The wrapped code of the package.
     */
    $$notifyLoad : function(id, closure) {
      this.getInstance().saveClosure(id, closure);
    }
  },


  members :
  {
    __loader : null,
    __packages : null,
    __parts : null,
    __packageClosureListeners : null,


    /**
     * This method is only for testing purposes! Don't use it!
     *
     * @internal
     * @param pkg {qx.io.part.Package} The package to add to the internal
     *   registry of packages.
     */
    addToPackage : function(pkg) {
      this.__packages[pkg.getId()] = pkg;
    },


    /**
     * Internal helper method to save the closure and notify that the load.
     *
     * @internal
     * @param id {String} The hash of the package.
     * @param closure {Function} The code of the package wrappen into a closure.
     */
    saveClosure : function(id, closure)
    {
      // search for the package
      var pkg = this.__packages[id];

      // error if no package could be found
      if (!pkg) {
        throw new Error("Package not available: " + id);
      }

      // save the closure in the package itself
      pkg.saveClosure(closure);

      // call the listeners
      var listeners = this.__packageClosureListeners[id];
      if (!listeners) {
        return;
      }
      for (var i = 0; i < listeners.length; i++) {
        listeners[i]("complete", id);
      }
      // get rid of all closure package listeners for that package
      this.__packageClosureListeners[id] = [];
    },


    /**
     * Internal method for testing purposes which returns the internal parts
     * store.
     *
     * @internal
     * @return {Array} An array of parts.
     */
    getParts : function() {
      return this.__parts;
    },


    /**
     * Loads one or more parts asynchronously. The callback is called after all
     * parts and their dependencies are fully loaded. If the parts are already
     * loaded the callback is called immediately.
     *
     * @param partNames {String|String[]} List of parts names to load as defined
     *   in the config file at compile time. The method also accepts a single
     *   string as parameter to only load one part.
     * @param callback {Function} Function to execute on completion.
     *   The function has one parameter which is an array of ready states of
     *   the parts specified in the partNames argument.
     * @param self {Object?window} Context to execute the given function in
     */
    require : function(partNames, callback, self)
    {
      var callback = callback || function() {};
      var self = self || window;

      if (qx.Bootstrap.isString(partNames)) {
        partNames = [partNames];
      }

      var parts = [];
      for (var i=0; i<partNames.length; i++) {
        var part = this.__parts[partNames[i]];
        if (part === undefined) {
          var registeredPartNames = qx.Bootstrap.keys(this.getParts());
          throw new Error('Part "' + partNames[i] + '" not found in parts (' +
            registeredPartNames.join(', ') + ')');
        } else {
          parts.push(part);
        }
      }

      var partsLoaded = 0;
      var onLoad = function() {
        partsLoaded += 1;
        // done?
        if (partsLoaded >= parts.length) {
          // gather the ready states of the parts
          var states = [];
          for (var i = 0; i < parts.length; i++) {
            states.push(parts[i].getReadyState());
          }
          callback.call(self, states);
        }
      };

      for (var i=0; i<parts.length; i++) {
        parts[i].load(onLoad, this);
      }
    },


    /**
     * Preloader for the given part.
     *
     * @param partNames {String} The hash of the part to preload.
     * @param callback {Function} Function to execute on completion.
     *   The function has one parameter which is an array of ready states of
     *   the parts specified in the partNames argument.
     * @param self {Object?window} Context to execute the given function in
     */
    preload : function(partNames, callback, self)
    {
      if (qx.Bootstrap.isString(partNames)) {
        partNames = [partNames];
      }

      var partsPreloaded = 0;
      for (var i=0; i<partNames.length; i++) {

        this.__parts[partNames[i]].preload(function() {
          partsPreloaded++;

          if (partsPreloaded >= partNames.length) {
            // gather the ready states of the parts
            var states = [];
            for (var i = 0; i < partNames.length; i++) {
              states.push(this.__parts[partNames[i]].getReadyState());
            };
            if (callback) {
              callback.call(self, states);
            }
          };
        }, this);
      }
    },


    /**
     * Get the URI lists of all packages
     *
     * @return {String[][]} Array of URI lists for each package
     */
    __getUris : function()
    {
      var packages = this.__loader.packages;
      var uris = [];
      for (var key in packages) {
        uris.push(this.__decodeUris(packages[key].uris));
      }
      return uris;
    },


    /**
     * Decodes a list of source URIs. The function is defined in the loader
     * script.
     *
     * @signature function(compressedUris)
     * @param compressedUris {String[]} Array of compressed URIs
     * @return {String[]} decompressed URIs
     */
    __decodeUris : qx.$$loader.decodeUris,


    /*
    ---------------------------------------------------------------------------
      PART
    ---------------------------------------------------------------------------
    */

    __partListners : null,


    /**
     * Register callback, which is called after the given part has been loaded
     * or fails with an error. After the call the listener is removed.
     *
     * @internal
     *
     * @param part {Object} Part to load
     * @param callback {Object} the listener
     */
    addPartListener : function(part, callback)
    {
      var key = part.getName();
      if (!this.__partListners[key]) {
        this.__partListners[key] = [];
      }
      this.__partListners[key].push(callback);
    },


    /**
     * If defined this method is called after each part load.
     */
    onpart : null,


    /**
     * This method is called after a part has been loaded or failed to load.
     * It calls all listeners for this part.
     *
     * @internal
     * @param part {Object} The loaded part
     */
    notifyPartResult : function(part)
    {
      var key = part.getName();

      var listeners = this.__partListners[key];
      if (listeners)
      {
        for (var i = 0; i < listeners.length; i++) {
          listeners[i](part.getReadyState());
        }
        this.__partListners[key] = [];
      }

      if (typeof this.onpart === "function") {
        this.onpart(part);
      }
    },


    /*
    ---------------------------------------------------------------------------
      PACKAGE
    ---------------------------------------------------------------------------
    */

    __packageListeners : null,


    /**
     * Register callback, which is called after the given package has been loaded
     * or fails with an error. After the call the listener is removed.
     *
     * @internal
     *
     * @param pkg {Object} Package to load
     * @param callback {Object} the listener
     */
    addPackageListener : function(pkg, callback)
    {
      var key = pkg.getId();
      if (!this.__packageListeners[key]) {
        this.__packageListeners[key] = [];
      }
      this.__packageListeners[key].push(callback);
    },


    /**
     * This method is called after a packages has been loaded or failed to load.
     * It calls all listeners for this package.
     *
     * @internal
     * @param pkg {Object} The loaded package
     */
    notifyPackageResult : function(pkg)
    {
      var key = pkg.getId();

      var listeners = this.__packageListeners[key];
      if (!listeners) {
        return;
      }
      for (var i=0; i<listeners.length; i++) {
        listeners[i](pkg.getReadyState());
      }
      this.__packageListeners[key] = [];
    }
  }
});
