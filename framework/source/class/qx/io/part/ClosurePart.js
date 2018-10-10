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
 * Wrapper for a part as defined in the config file. This class knows about all
 * packages the part depends on and provides functionality to load the part.
 *
 * @internal
 */
qx.Bootstrap.define("qx.io.part.ClosurePart",
{
  extend : qx.io.part.Part,

  /**
   * @param name {String} Name of the part as defined in the config file at
   *    compile time.
   * @param packages {qx.io.part.Package[]} List of dependent packages
   * @param loader {qx.Part} The loader of this part.
   */
  construct : function(name, packages, loader)
  {
    qx.io.part.Part.call(this, name, packages, loader);
  },


  members :
  {
    __packagesToLoad : 0,


    // overridden
    preload : function(callback, self)
    {
      // store how many packages are already preloaded
      var packagesLoaded = 0;
      var that = this;

      for (var i = 0; i < this._packages.length; i++)
      {
        var pkg = this._packages[i];
        if (pkg.getReadyState() == "initialized") {

          pkg.loadClosure(function(pkg) {
            packagesLoaded++;
            that._loader.notifyPackageResult(pkg);
            // everything loaded?
            if (packagesLoaded >= that._packages.length && callback) {
              callback.call(self);
            }
          }, this._loader);
        }
      }
    },


    /**
     * Loads the closure part including all its packages. The loading will
     * be done parallel. After all packages are available, the closures are
     * executed in the correct order.
     *
     * @param callback {Function} The function to call after the loading.
     * @param self {Object?} The context of the callback.
     */
    load : function(callback, self)
    {
      if (this._checkCompleteLoading(callback, self)) {
        return;
      };

      this._readyState = "loading";

      if (callback) {
        this._appendPartListener(callback, self, this);
      }

      this.__packagesToLoad = this._packages.length;

      for (var i = 0; i < this._packages.length; i++)
      {
        var pkg = this._packages[i];
        var pkgReadyState = pkg.getReadyState();

        // trigger loading
        if (pkgReadyState == "initialized") {
          pkg.loadClosure(this._loader.notifyPackageResult, this._loader);
        }

        // Listener for package changes
        if (pkgReadyState == "initialized" || pkgReadyState == "loading")
        {
          this._loader.addPackageListener(
            pkg,
            qx.Bootstrap.bind(this._onPackageLoad, this, pkg)
          );
        }
        else if (pkgReadyState == "error")
        {
          this._markAsCompleted("error");
          return;
        }
        else {
          // "complete" and "cached"
          this.__packagesToLoad--;
        }
      }

      // execute closures in case everything is already loaded/cached
      if (this.__packagesToLoad <= 0) {
        this.__executePackages();
      }
    },


    /**
     * Executes the packages in their correct order and marks the part as
     * complete after execution.
     */
    __executePackages : function()
    {
      for (var i = 0; i < this._packages.length; i++) {
        this._packages[i].execute();
      }
      this._markAsCompleted("complete");
    },


    /**
     * Handler for every package load. It checks for errors and decreases the
     * packages to load. If all packages has been loaded, it invokes the
     * execution.
     *
     * @param pkg {qx.io.part.Package} The loaded package.
     */
    _onPackageLoad : function(pkg)
    {
      // if the part already has an error, ignore the callback
      if (this._readyState == "error") {
        return;
      }

      // one error package results in an error part
      if (pkg.getReadyState() == "error") {
        this._markAsCompleted("error");
        return;
      }

      // every package could be loaded -> execute the closures
      this.__packagesToLoad--;
      if (this.__packagesToLoad <= 0) {
        this.__executePackages();
      }
    }
  }
});