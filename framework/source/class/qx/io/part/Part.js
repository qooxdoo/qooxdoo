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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Wrapper for a part as defined in the config file. This class knows about all
 * packages the part depends on and provides functionality to load the part.
 *
 * @internal
 */
qx.Bootstrap.define("qx.io.part.Part",
{
  /**
   * Constructor
   *
   * @param name {String}
   *   Name of the part as defined in the config file at compile time.
   *
   * @param packages {Package[]}
   *   List of dependent packages
   *
   * @param loader {qx.Part}
   *   Loader of this part
   */
  construct : function(name, packages, loader)
  {
    this.__name = name;
    this._readyState = "complete";
    this._packages = packages;
    this._loader = loader;

    for (var i=0; i<packages.length; i++)
    {
      if (packages[i].getReadyState() !== "complete")
      {
        this._readyState = "initialized";
        break;
      }
    }
  },


  members :
  {
    _readyState : null,
    _loader : null,
    _packages : null,
    __name : null,


    /**
     * Get the ready state of the part.
     *
     * @return {String}
     * <ul>
     *  <li>
     *   <b>initialized</b>: Part is initialized. The {@link #load}
     *    method has not yet been called
     *  </li>
     *  <li><b>loading</b>: Part is still loading.</li>
     *  <li><b>complete</b>: Part has been loaded successfully</li>
     * </ul>
     */
    getReadyState : function()
    {
      return this._readyState;
    },


    /**
     * The part name as defined in the config file.
     *
     * @return {String}
     *   Part name
     */
    getName : function()
    {
      return this.__name;
    },


    /**
     * Internal helper for testing purposes.
     *
     * @internal
     *
     * @return {qx.io.part.Package[]}
     *   Contained packages in an array.
     */
    getPackages : function()
    {
      return this._packages;
    },


    /**
     * Method for preloading this part.
     * Empty implementation! Regular parts can not be preloaded.
     *
     * @param callback {Function}
     *   Callback for the preload
     *
     * @param self {Object?}
     *   Context of the callback
     */
    preload : function(callback, self)
    {
      // Just do nothing because you can not preload regular parts.
      // Also, loading the part here is not a good idea because it could break
      // the load order of the packages if someone uses preload right after
      // loading another part. So we just invoke the callback async.
      if (callback)
      {
        window.setTimeout(function() {
          callback.call(self, this);
        }, 0);
      }
    },


    /**
     * Loads the part asynchronously. The callback is called after the part and
     * its dependencies are fully loaded. If the part is already loaded the
     * callback is called immediately.
     *
     * @internal
     *
     * @param callback {Function}
     *   Function to execute on completion
     *
     * @param self {Object?window}
     *   Context to execute the given function in
     */
    load : function(callback, self)
    {
      if (this._checkCompleteLoading(callback, self))
      {
        return;
      };

      this._readyState = "loading";

      if (callback)
      {
        this._appendPartListener(callback, self, this);
      }

      var part = this;
      var onLoad = function()
      {
        part.load();
      }

      for (var i=0; i<this._packages.length; i++)
      {
        var pkg = this._packages[i];

        switch (pkg.getReadyState())
        {
          case "initialized":
            this._loader.addPackageListener(pkg, onLoad);
            pkg.load(this._loader.notifyPackageResult, this._loader);
            return;

          case "loading":
            this._loader.addPackageListener(pkg, onLoad);
            return;

          case "complete":
            break;

          case "error":
            this._markAsCompleted("error");
            return;

          default:
            throw new Error("Invalid case! " + pkg.getReadyState());
        }
      }

      this._markAsCompleted("complete");
    },


    /**
     * Helper for appending a listener to this part.
     *
     * @param callback {Function}
     *   The function to call when the part is loaded.
     *
     * @param self {Object?}
     *   Context of the callback
     *
     * @param part {qx.io.part.Part|qx.io.part.ClosurePart}
     *   Part to listen to
     */
    _appendPartListener : function(callback, self, part)
    {
      var that = this;

      this._loader.addPartListener(this, function() {
        that._signalStartup();
        callback.call(self, part._readyState);
      });
    },


    /**
     * Helper for marking the part as complete.
     *
     * @param readyState {String}
     *   New ready state
     */
    _markAsCompleted : function(readyState)
    {
      this._readyState = readyState;
      this._loader.notifyPartResult(this);
    },


    /**
     * Method used to start up the application in case not all parts
     * necessary to initialize the application are in the boot part. [BUG #3793]
     */
    _signalStartup : function()
    {
      // Signal the application startup if not already done
      if (!qx.$$loader.applicationHandlerReady)
      {
        qx.$$loader.signalStartup();
      }
    },


    /**
     * Helper for checking if the part is loaded completely.
     *
     * @param callback {Function}
     *   Function to be called if the part has been loaded completely.
     *
     * @param self {Object}
     *   Context of the callback function.
     *
     * @return {Boolean}
     *   <code>true</code>  Part is loading, complete or has an error
     *   <code>false</code> Part is not loading, incomplete or hasnt an error
     */
    _checkCompleteLoading : function(callback, self)
    {
      // Check if its already loaded
      var readyState = this._readyState;

      if (readyState == "complete" || readyState == "error")
      {
        if (callback)
        {
          var that = this;

          setTimeout(function() {
            that._signalStartup();
            callback.call(self, readyState);
          }, 0);
        }

        return true;
      }
      // Add a listener if it is currently loading
      else if (readyState == "loading" && callback)
      {
        this._appendPartListener(callback, self, this);

        return true;
      }
    }
  }
});
