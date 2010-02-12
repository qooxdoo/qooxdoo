/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The part loader knows about all generated packages and parts.
 *
 * It contains functionality to load parts and to retrieve part instances.
 */
qx.Class.define("qx.io.PartLoader",
{
  type : "singleton",
  extend : qx.core.Object,

  
  construct : function()
  {
    this.base(arguments);

    this.__packages = [];
    var uris = this._getUris();
    for (var i=0; i<uris.length; i++)
    {
      var hash = qx.$$loader.packageHashes[i];
      var pkg = new qx.io.part.Package(uris[i], hash, i==0);
      pkg.addListener("load", this._onPackageLoad, this);
      this.__packages.push(pkg);
    };
    
    var safeLoading = qx.$$loader.safeLoading || [];
    for (var i=0; i<safeLoading.length; i++) {
      this.__packages[safeLoading[i]].setUseSafeScriptLoader(true);
    }

    this.__parts = {};
    var parts = qx.$$loader.parts;

    for (var name in parts)
    {
      var pkgIndexes = parts[name];
      var packages = [];
      for (var i=0; i<pkgIndexes.length; i++) {
        packages.push(this.__packages[pkgIndexes[i]]);
      }
      var part = new qx.io.part.Part(name, packages);
      part.addListener("load", function(e) {
        this.fireDataEvent("partLoaded", e.getTarget());
      }, this);
      part.addListener("error", function(e) {
        this.fireDataEvent("partLoadingError", e.getTarget().getName());
      }, this);
      this.__parts[name] = part;
    }
  },


  events :
  {
    /**
     * Fired if a parts was loaded. The data of the event instance point to the
     * loaded part instance.
     */
    "partLoaded" : "qx.event.type.Data",

    /**
     * Fired if a part could not be loaded. The event's
     * {@link qx.event.Data#data} property contains the name if the failed part.
     */
    "partLoadingError" : "qx.event.type.Data"
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
    require : function(partNames, callback, self) {
      this.getInstance().require(partNames, callback, self);
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
        parts.push(this.getPart(partNames[i]));
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

    __packages : null,

    __parts : null,

    /**
     * Get the part instance of the part with the given name.
     *
     * @param name {String} Name of the part as defined in the config file at
     *    compile time.
     * @return {Part} The corresponding part instance
     */
    getPart : function(name)
    {
      var part = this.__parts[name];

      if (!part) {
        throw new Error("No such part: " + name)
      }

      return part;
    },


    /**
     * After a package is loaded import the package data.
     * 
     * @param e {qx.event.type.Event} The event object
     */
    _onPackageLoad : function(e) {
      this._importPackageData(e.getTarget().getId());
    },
    
    
    /**
     * Import the data of a package. The function is defined in the loader
     * script.
     *
     * @signature function(packageData)
     * @param packageData {Map} Map of package data categories ("resources",...)
     */
    _importPackageData : qx.$$loader.importPackageData,
    
    
    /**
     * Get the URI lists of all packages
     *
     * @return {String[][]} Array of URI lists for each package
     */
    _getUris : function()
    {
      var packages = qx.$$loader.uris;
      var uris = [];
      for (var i=0; i<packages.length; i++) {
        uris.push(this._decodeUris(packages[i]));
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
    _decodeUris : qx.$$loader.decodeUris
  },



  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function() {
     this._disposeObjects("__parts", "__packages");
   }
});
