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
qx.Bootstrap.define("qx.io.part.ClosurePart",
{
  extend : qx.io.part.Part,
  
  construct : function(name, packages, loader) {
    qx.io.part.Part.call(this, name, packages, loader);
  },
  
  
  members : 
  {
    __packagesToLoad : 0,
    
    
    load : function(callback, self) 
    {
      if (this._checkCompleteLoading(callback, self)) {
        return;
      };
            
      // now loading starts
      this._readyState = "loading";

      // register a listener if we have a callback
      if (callback) {
        this._appendPartListener(callback, self, this);
      }

      // save the number of packages to load 
      // (will be reduced on every loaded package)
      this.__packagesToLoad = this._packages.length;

      // handler for every loaded package
      var part = this;
      var onLoad = function(readyState) {
        part.__onLoad.call(part, readyState);
      }
      
      // save the number of packages already completed
      var completeCount = 0;
      // handle every package
      for (var i = 0; i < this._packages.length; i++)
      {
        var pkg = this._packages[i];
        switch (pkg.getReadyState())
        {
          // not loadded and not started to load
          case "initialized":
            this._loader.addPackageListener(pkg, onLoad);
            pkg.load(this._loader.notifyPackageResult, this._loader);
            break; 
            
          // already started loading but not done
          case "loading":
            this._loader.addPackageListener(pkg, onLoad);
            break;

          // done loading
          case "complete":
            this.__packagesToLoad--;
            completeCount++;
            break;
          
          // something went wrong during the loading
          case "error":
            this._markAsCompleted("error");
            return;

          default:
            throw new Error("Invalid case! " + pkg.getReadyState());
        }
      }
      
      // if all packages are already loaded
      if (completeCount == this._packages.length) {
        this._markAsCompleted("complete");
      }
    },
    
        
    __onLoad : function(readyState) 
    {
      // error handling
      if (readyState != "complete") {
        if (this._readyState != "error") {
          this._markAsCompleted("error");
        }
        return;
      }
      
      this.__packagesToLoad--;
      if (this.__packagesToLoad === 0)
      {
        // invoke the execution if every package is loaded         
        var closures = this._loader.getClosures();
        for (var i = 0; i < this._packages.length; i++) {
          var key = this._packages[i].getId();
          if (closures[key]) {
            closures[key]();
            delete closures[key];
          }
        };
        
        this._markAsCompleted("complete");
      }      
    }
  }
});