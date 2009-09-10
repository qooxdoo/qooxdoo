/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#require(qx.util.DeferredCallManager)

************************************************************************ */

/**
 * This class represents a wrapper for functions, which should be called after
 * the current thread of JavaScript has finished and the control is returned to
 * the browser. The wrapped function will at most be called once after the control
 * has been given back to the browser, independent of the number of {@link #call}
 * calls.
 */
qx.Class.define("qx.util.DeferredCall",
{
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param callback {Function} The callback
   * @param context {Object?window} the context in which the function will be called.
   */
  construct : function(callback, context)
  {
    this.base(arguments);

    this.__callback = callback;
    this.__context = context || null;
    this.__manager = qx.util.DeferredCallManager.getInstance();
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __callback : null,
    __context : null,
    __manager : null,

    /**
     * Prevent the callback from being called.
     */
    cancel : function() {
      this.__manager.cancel(this);
    },


    /**
     * Issue a deferred call of the callback.
     */
    schedule : function() {
      this.__manager.schedule(this);
    },


    /**
     * Calls the callback directly.
     */
    call : function() {
      this.__context ? this.__callback.apply(this.__context) : this.__callback();
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function(callback, context)
  {
    this.cancel();
    this._disposeFields("__context", "__callback", "__manager");
  }
});
