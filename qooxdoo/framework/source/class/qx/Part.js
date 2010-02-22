/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#require(qx.io.ScriptLoader)

************************************************************************ */

/**
 * The part loader knows about all generated packages and parts.
 *
 * It contains functionality to load parts.
 */
qx.Bootstrap.define("qx.Part",
{
  /**
   * @param loader {Object} The data structure from the boot script about all
   *   known parts and packages. Usually <code>qx.$$loader</code>.
   */
  construct : function(loader) 
  {
    this.__loader = loader;
    
    this.__partListners = {};
    this.__packageListeners = {};
    this.__packageClosureListeners = {};
    this.__closures = {};
    
    this.__packages = [];
    var uris = this.__getUris();
    for (var i=0; i<uris.length; i++)
    {
      var hash = loader.packageHashes[i];
      var pkg = new qx.io.part.Package(uris[i], hash, i==0);
      this.__packages.push(pkg);
    };
    
    this.__parts = {};
    var parts = loader.parts;
    var closureParts = loader.closureParts || {};
  
    for (var name in parts)
    {
      var pkgIndexes = parts[name];
      var packages = [];
      for (var i = 0; i < pkgIndexes.length; i++) {
        packages.push(this.__packages[pkgIndexes[i]]);
      }
      
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
     * Loaded scripts have to call this method to indicate successful loading
     * 
     * @param id {String} script id
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
    __closures : null,
    __packageClosureListeners : null,
    
    
    /**
     * This method is only for testing purposes! Don't use it!
     * 
     * @internal
     * @param pkg {qx.io.part.Package} The package to add to the internal
     *   registry of packages.
     */
    addToPackage : function(pkg) {
      this.__packages.push(pkg);
    },
    
    
    addClosurePackageListener : function(pkg, callback)
    {
      var key = pkg.getId();
      if (!this.__packageClosureListeners[key]) {
        this.__packageClosureListeners[key] = [];
      }
      this.__packageClosureListeners[key].push(callback);
    },
        
    
    saveClosure : function(id, closure) {
      this.__closures[id] = closure;
      
      // search for the package
      var pkg;
      for (var i = 0; i < this.__packages.length; i++) {
        if (this.__packages[i].getId() == id) {
          pkg = this.__packages[i];
          break;
        }
      };
      // error if no package could be found
      if (!pkg) {
        throw new Error("Package not available");
      }
      
      // call the listeners
      var listeners = this.__packageClosureListeners[id];
      if (!listeners) {
        return;
      }
      for (var i = 0; i < listeners.length; i++) {
        listeners[i]("complete", id);
      }
      this.__packageClosureListeners[id] = [];      
    },

    
    /**
     * @internal
     */
    getClosures : function() {
      return this.__closures;
    },

    
    /**
     * @internal
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
     *    in the config file at compile time. The method also accepts a single
     *    string as parameter to only load one part.
     * @param callback {Function} Function to execute on completion
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
        parts.push(this.__parts[partNames[i]]);
      }

      var partsLoaded = 0;
      var onLoad = function() {
        partsLoaded += 1;
        if (partsLoaded >= parts.length) {
          callback.call(self)
        }
      }

      for (var i=0; i<parts.length; i++) {
        parts[i].load(onLoad, this);
      }
    },
    
    
    /**
     * Get the URI lists of all packages
     *
     * @return {String[][]} Array of URI lists for each package
     */
    __getUris : function()
    {
      var packages = this.__loader.uris;
      var uris = [];
      for (var i=0; i<packages.length; i++) {
        uris.push(this.__decodeUris(packages[i]));
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
    
    
    /**
     * Import the data of a package. The function is defined in the loader
     * script.
     *
     * @signature function(packageData)
     * @param packageData {Map} Map of package data categories ("resources",...)
     */
    __importPackageData : qx.$$loader.importPackageData,    
    
    
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
      if (typeof this.onpart == "function") {
        this.onpart(part);
      }
      
      
      var key = part.getName();
      var listeners = this.__partListners[key];
      if (!listeners) {
        return;
      }
      for (var i = 0; i < listeners.length; i++) {
        listeners[i](part.getReadyState());
      }
      this.__partListners[key] = [];            
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
      
      if (pkg.getReadyState() == "complete") {
        this.__importPackageData(qx.$$packageData[key] || {});
      }
      
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