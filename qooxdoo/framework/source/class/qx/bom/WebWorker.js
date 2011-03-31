/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Adrian Olaru (adrianolaru)

************************************************************************ */


/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * Web Workers allows us to run JavaScript in parallel on a web page,
 * without blocking the user interface. A 'worker' is just another script
 * file that will be loaded and executed in the background.
 *
 * For more information see:
 * http://www.w3.org/TR/workers
 */
qx.Class.define("qx.bom.WebWorker",
{
  extend : qx.core.Object,


  /**
   * Create a new instance.
   *
   * @param src {String} The path to worker as an URL
   */
  construct: function(src)
  {
    this.base(arguments);
    this._worker = new window.Worker(src);

    this._handleMessageBound = qx.lang.Function.bind(this._handleMessage, this);
    this._handleErrorBound = qx.lang.Function.bind(this._handleError, this);

    qx.bom.Event.addNativeListener(this._worker, "message", this._handleMessageBound);
    qx.bom.Event.addNativeListener(this._worker, "error", this._handleErrorBound);
  },


  events :
  {
    /** Fired when worker sends a message */
    "message": "qx.event.type.Data",

    /** Fired when an error occurs */
    "error": "qx.event.type.Data"
  },


  members :
  {
    _worker : null,
    _handleErrorBound : null,
    _handleMessageBound : null,


    /**
     * Send a message to the worker.
     * @param msg {String} the message
     */
    postMessage: function(msg) {
      this._worker.postMessage(msg);
    },


    /**
     * Message handler
     * @param e {object} message event
     */
    _handleMessage: function(e) {
      this.fireDataEvent("message", e.data);
    },


    /**
     * Error handler
     * @param e {object} error event
     */
    _handleError: function(e) {
      this.fireDataEvent("error", e.message);
    }
  },


  destruct : function()
  {
    qx.bom.Event.removeNativeListener(this._worker, "message", this._handleMessageBound);
    qx.bom.Event.removeNativeListener(this._worker, "error", this._handleErrorBound);
    if (this._worker)
    {
      this._worker.terminate();
      this._worker = null;
    }
  }
});
