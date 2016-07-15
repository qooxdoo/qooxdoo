/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This class represents a wrapper for functions, which should be called after
 * the current thread of JavaScript has finished and the control is returned to
 * the browser. The wrapped function will at most be called once after the control
 * has been given back to the browser, independent of the number of {@link #call}
 * calls.
 * 
 * This class does not need to be disposed, although doing so will cancel any
 * pending call
 *
 * @require(qx.util.DeferredCallManager)
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

      if (qx.core.Environment.get("qx.debug")) {
        // warn if the context is disposed
        var context = this.__context;
        if (context && context.isDisposed && context.isDisposed()) {
          this.warn(
            "The context object '" + context + "' of the defered call '" +
            this + "'is already disposed."
          );
        }
      }

      this.__context ? this.__callback.apply(this.__context) : this.__callback();
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.cancel();
    this.__context = this.__callback = this.__manager = null;
  }
});
