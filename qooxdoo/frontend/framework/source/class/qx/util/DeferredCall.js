/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

************************************************************************ */

/**
 * This class represents a wrapper for functions, which should be called after
 * the current thread of JavaScript has finished and the control is returned to
 * the browser. The wrapped function will at most be called once after the control
 * has been given back to the browser, independent of the number of {@link #call}
 * calls.
 */
qx.Class.define("qx.util.DeferredCall", {

  extend : qx.core.Object,

  /**
   * @param callback {Function} The callback
   * @param context {Object?window} the context in which the function will be called.
   */
  construct : function(callback, context)
  {
    this._callback = callback;
    this._context = context || window;

    this._timeoutId = null;
    this._callHelper = qx.lang.Function.bind(this.__call, this);
  },

  members :
  {

    /**
     * Prevent the callback from being called.
     */
    cancel : function()
    {
      if (this._timeoutId != null)
      {
        window.clearTimeout(this._timeoutId);
        this._timeoutId = null;
      }
    },


    /**
     * Issue a deferred call of the callback.
     */
    call : function()
    {
      if (this._timeoutId == null) {
        this._timeoutId = window.setTimeout(this._callHelper, 0);
      }
    },


    /**
     * Helper function for the timer.
     *
     * @type static
     * @return {void}
     */
    __call : function()
    {
      this._timeoutId = null;
      this._callback.call(this._context);
    }

  }
});