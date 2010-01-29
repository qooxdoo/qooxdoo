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
qx.Class.define("qx.io.part.Part",
{
  extend : qx.core.Object,

  /**
   * @param name {String} Name of the part as defined in the config file at
   *    compile time.
   * @param packages {Package[]} List of dependent packages
   */
  construct : function(name, packages)
  {
    this.base(arguments);

    this.__name = name;
    this.__readyState = "complete";
    this.__packages = packages;

    for (var i=0; i<packages.length; i++)
    {
      if (packages[i].getReadyState() !== "complete")
      {
        this.__readyState = "initialized";
        break;
      }
    }
  },


  events :
  {
    /** This event is fired after the part has been loaded successfully. */
    "load" : "qx.event.type.Event",
    
    /**
     * The error event is fired if a part could not be loaded. The event's
     * {@link qx.event.Data#data} property contains the failed {@link package}.
     */
    "error" : "qx.event.type.Data"
  },


  members :
  {

    __readyState : null,

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
      return this.__readyState;
    },

    __name : null,

    /**
     * The part name as defined in the config file
     *
     * @return {String} The part name
     */
    getName : function() {
      return this.__name;
    },

    __packages : null,


    /**
     * Loads the part asynchronously. The callback is called after the part and
     * its dependencies are fully loaded. If the part is already loaded the
     * callback is called immediately.
     *
     * @param callback {Function} Function to execute on completion
     * @param self {Object?window} Context to execute the given function in
     */
    load : function(callback, self)
    {
      if (this.__readyState == "complete" || this.__readyState == "error")
      {
        if (callback) {
          callback.call(self, this.getReadyState());
        }
        return;
      }
      else if (this.__readyState == "loading" && callback)
      {
        this.__addLoadAndErrorHandlerOnce(this, function() {
          callback.call(self, this.getReadyState());
        }, this);
        return;
      }
      
      this.__readyState = "loading";

      if (callback) {
        this.__addLoadAndErrorHandlerOnce(this, function() {
          callback.call(self, this.getReadyState());
        }, this);
      }

      var onLoad = function() {
        this.load();
      }

      for (var i=0; i<this.__packages.length; i++)
      {
        var pkg = this.__packages[i];
        switch (pkg.getReadyState())
        {
          case "initialized":            
            this.__addLoadAndErrorHandlerOnce(pkg, onLoad, this);
            pkg.load();
            return;

          case "loading":
            this.__addLoadAndErrorHandlerOnce(pkg, onLoad, this);
            return;

          case "complete":
            break;
            
          case "error":
            this.__readyState = "error";
            this.fireDataEvent("error", pkg);
            return;

          default:
            throw new Error("Invalid case!");
        }
      }

      this.__readyState = "complete";
      this.fireEvent("load");
    },
    
    
    /**
     * Add a listener to the "load" and "error" event. Once one of those events
     * is fired the listener is removed from both events.
     * 
     * @param target {qx.core.Object} The event target
     * @param callback {Function} The event listener
     * @param self {Object} The context for the listener
     */
    __addLoadAndErrorHandlerOnce : function(target, callback, self)
    {
      var wrapper = function(e) {
        callback.call(self, e);
        target.removeListenerById(loadId);
        target.removeListenerById(errorId);
      }
      var loadId = target.addListener("load", wrapper);
      var errorId = target.addListener("error", wrapper);
    }
  },


  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function() {
     this._disposeArray("__packages");
   }
});