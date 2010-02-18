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
 * Wrapper for a part as defined in the config file. This class knows about all
 * packages the part depends on and provides functionality to load the part.
 *
 * @internal
 */
qx.Bootstrap.define("qx.io.part.Part",
{
  /**
   * @param name {String} Name of the part as defined in the config file at
   *    compile time.
   * @param packages {Package[]} List of dependent packages
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
     * Get the ready state of the part. The value is one of
     * <ul>
     * <li>
     *   <b>initialized</b>: The part is initialized. The {@link #load}
     *   method has not yet been called
     * </li>
     * <li><b>loading</b>: The part is still loading.</li>
     * <li><b>complete</b>: The part has been loaded successfully</li>
     * </li>
     *
     * @return {String} The ready state.
     */
    getReadyState : function() {
      return this._readyState;
    },


    /**
     * The part name as defined in the config file
     *
     * @return {String} The part name
     */
    getName : function() {
      return this.__name;
    },
    
    
    /**
     * @internal
     */
    getPackages : function()
    {
      return this._packages;
    },
    
    
    /**
     * Loads the part asynchronously. The callback is called after the part and
     * its dependencies are fully loaded. If the part is already loaded the
     * callback is called immediately.
     *
     * @internal
     * 
     * @param callback {Function} Function to execute on completion
     * @param self {Object?window} Context to execute the given function in
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

      var part = this;
      var onLoad = function() {
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
            this._readyState = "error";
            this._loader.notifyPartResult(this);
            return;

          default:
            throw new Error("Invalid case! " + pkg.getReadyState());
        }
      }

      this._markAsCompleted(this);
    },
    

    _appendPartListener : function(callback, self, part) {
      this._loader.addPartListener(this, function() {
        callback.call(self, part._readyState);
      });
    },
    
    
    _markAsCompleted : function(part) 
    {
      part._readyState = "complete";
      part._loader.notifyPartResult(part);
    },
    
    
    _checkCompleteLoading : function(callback, self) {
      // check if its already loaded
      if (this._readyState == "complete" || this._readyState == "error") {
        if (callback) {
          callback.call(self, this._readyState);
        }
        return true;
      }
      // add a listener if its currently loading
      else if (this._readyState == "loading" && callback) {
        this._appendPartListener(callback, self, this);
        return true;
      }      
    }
  }
});