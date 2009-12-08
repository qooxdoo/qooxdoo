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
qx.Class.define("qx.part.Part",
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
    "load" : "qx.event.type.Event"
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
      if (this.__readyState == "complete")
      {
        if (callback) {
          callback.call(self);
        }
        return;
      }
      else if (this.__readyState == "loading")
      {
        if (callback) {
          this.addListenerOnce("load", callback, self);
        }
        return;
      }

      if (callback) {
        this.addListenerOnce("load", callback, self);
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
            pkg.addListenerOnce("load", onLoad, this);
            pkg.load();
            return;

          case "loading":
            pkg.addListenerOnce("load", onLoad, this);
            return;

          case "complete":
            break;

          default:
            throw new Error("Invalid case!")
        }
      }

      this.__readyState = "complete";
      this.fireEvent("load");
    }
  },


  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function() {
     this._disposeObjects("__packages");
   }
});