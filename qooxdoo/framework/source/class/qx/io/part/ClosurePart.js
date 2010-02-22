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
  
  construct : function(name, packages, loader)
  {
    if (packages.length !== 1) {
      throw new TypeError("closure parts must have exactly one package!");
    }
    qx.io.part.Part.call(this, name, packages, loader);
    
    this.__package = packages[0];
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

      // handler for every loaded package
      var part = this;
      var onLoad = function(readyState) {
        part.__onLoad.call(part, readyState);
      }
      
      var pkg = this.__package;
      var readyState = pkg.getReadyState();
      switch (readyState)
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
        case "error":
          this._markAsCompleted(readyState);
          break;

        default:
          throw new Error("Invalid case! " + readyState);
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
      
      // invoke the execution if every package is loaded         
      var closures = this._loader.getClosures();
      var key = this.__package.getId();
      if (closures[key])
      {
        closures[key]();
        delete closures[key];
      }
      
      this._markAsCompleted("complete");
    }      
  }
});