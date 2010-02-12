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
    
    this.__packages = [];
    var uris = this.__getUris();
    for (var i=0; i<uris.length; i++)
    {
      var hash = loader.packageHashes[i];
      var pkg = this.createPackage(uris[i], hash, i==0);
      this.__packages.push(pkg);
    };
    
    this.__parts = {};
    var parts = loader.parts;
  
    for (var name in parts)
    {
      var pkgIndexes = parts[name];
      var packages = [];
      for (var i=0; i<pkgIndexes.length; i++) {
        packages.push(this.__packages[pkgIndexes[i]]);
      }      
      var part = this.createPart(name, packages);       
      this.__parts[name] = part;
    }    
  },
  
  
  statics :
  {
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
    require : function(partNames, callback, self) 
    {
      if (!this.$$instance) {
        this.$$instance = new this(qx.$$loader);        
      }
      
      this.$$instance.require(partNames, callback, self);
    }
  },
  
  
  members :
  {
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
        this.loadPart(parts[i], onLoad, this);
      }
    },
    
    
    __packages : null,
    __parts : null,


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
    
    /**
     * Create part data structure.
     * @internal
     * 
     * @param name {String} Name of the part as defined in the config file at
     *    compile time.
     * @param packages {Package[]} List of dependent packages
     * @return {Map} The part data structure.
     */
    createPart : function(name, packages)
    {
      var part = {};
      part.name = name;
      part.readyState = "complete";
      part.packages = packages;

      for (var i=0; i<packages.length; i++)
      {
        if (packages[i].readyStategetre !== "complete")
        {
          part.readyState = "initialized";
          break;
        }
      }
      return part;
    },
    
    
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
      var key = part.hash;
      if (!this.__partListners[key]) {
        this.__partListners[key] = [];
      }
      this.__partListners[key].push(callback);
    },
    
    
    onpart : null,
    
    
    /**
     * This method is called after a part has been loaded or failed to load.
     * It calls all listeners for this part.
     * 
     * @param part {Object} The loaded part
     */    
    __notifyPartResult : function(part)
    {
      if (typeof this.onpart == "function") {
        this.onpart(part);
      }
      
      var key = part.hash;
      var listeners = this.__partListners[key];
      if (!listeners) {
        return;
      }
      for (var i=0; i<listeners.length; i++) {
        listeners[i](part.readyState);
      }
      this.__partListners[key] = [];            
    },
    
    
    /**
     * Loads the part asynchronously. The callback is called after the part and
     * its dependencies are fully loaded. If the part is already loaded the
     * callback is called immediately.
     *
     * @internal
     * 
     * @param part {Object} part to load
     * @param callback {Function} Function to execute on completion
     * @param self {Object?window} Context to execute the given function in
     */
    loadPart : function(part, callback, self)
    {
      if (part.readyState == "complete" || part.readyState == "error")
      {
        if (callback) {
          callback.call(self, part.readyState);
        }
        return;
      }
      else if (part.readyState == "loading" && callback)
      {
        this.addPartListener(part, function() {
          callback.call(self, part.readyState);
        }, this);
        return;
      }
      
      part.readyState = "loading";

      if (callback)
      {
        this.addPartListener(part, function() {
          callback.call(self, part.readyState);
        }, this);
      }

      var self = this;
      var onLoad = function() {
        self.loadPart(part);
      }

      for (var i=0; i<part.packages.length; i++)
      {
        var pkg = part.packages[i];
        switch (pkg.readyState)
        {
          case "initialized":            
            this.addPackageListener(pkg, onLoad);
            this.loadPackage(pkg);
            return;

          case "loading":
            this.addPackageListener(pkg, onLoad);
            return;

          case "complete":
            break;
            
          case "error":
            part.readyState = "error";
            this.__notifyPartResult(part);
            return;

          default:
            throw new Error("Invalid case! " + pkg.readyState);
        }
      }

      part.readyState = "complete";
      this.__notifyPartResult(part);
    },    
    
    
    /*
    ---------------------------------------------------------------------------
      PACKAGE
    ---------------------------------------------------------------------------
    */       
    
    
    /**
     * Create data structor for a package
     * 
     * @internal
     * 
     * @param urls {String[]} A list of script URLs
     * @param id {var} Unique package hash key
     * @param loaded {Boolean?false} Whether the package is already loaded
     */
    createPackage : function(urls, id, loaded)
    {
      return {
        readyState: loaded ? "complete" : "initialized",
        urls: urls,
        id: id
      };
    },
    
    
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
      var key = pkg.id;
      if (!this.__packageListeners[key]) {
        this.__packageListeners[key] = [];
      }
      this.__packageListeners[key].push(callback);
    },
    
    
    /**
     * This method is called after a packages has been loaded or failed to load.
     * It calls all listeners for this package.
     * 
     * @param pkg {Object} The loaded package
     */
    __notifyPackageResult : function(pkg)
    {
      var key = pkg.id;
      
      if (pkg.readyState == "success") {
        this.__importPackageData(key);
      }
      
      var listeners = this.__packageListeners[key];
      if (!listeners) {
        return;
      }
      for (var i=0; i<listeners.length; i++) {
        listeners[i](pkg.readyState);
      }
      this.__packageListeners[key] = [];      
    },
    
    
    /**
     * Load the part's script URLs in the correct order. A {@link #load} event
     * if fired once all scripts are loaded.
     * 
     * @internal
     * 
     * @param pkg {Object} package to load
     */
    loadPackage : function(pkg)
    {
      if (pkg.readyState !== "initialized") {
        return;
      }

      pkg.readyState = "loading";

      this.__loadScriptList(
        pkg.urls,
        function() {
          pkg.readyState = "complete";          
          this.__notifyPackageResult(pkg);
        },
        function() {
          pkg.readyState = "error";
          this.__notifyPackageResult(pkg);
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

      this.__readyState = "loading";

      var urlsLoaded = 0;
      var self = this;
      var onLoad = function(urls)
      {
        if (urlsLoaded >= urlList.length)
        {
          self.__readyState = "complete";
          callback.call(self);
          return;
        }

        var loader = new qx.io.ScriptLoader();
        
        loader.load(urls.shift(), function(status)
        {
          urlsLoaded += 1;
          loader.dispose();
          
          if (status !== "success") {
            return errBack.call(self);
          }
          
          if (qx.core.Variant.isSet("qx.client", "webkit"))
          {
            // force asynchronous load
            // Safari fails with an "maximum recursion depth exceeded" error if it is
            // called sync.
            setTimeout(function() {
              onLoad.call(self, urls, callback, self);
            }, 0);
          } else {
            onLoad.call(self, urls, callback, self);
          }
        }, self);
      }

      onLoad(urlList.concat());
    }
  }
});