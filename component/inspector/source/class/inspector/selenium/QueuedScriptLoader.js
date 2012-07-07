/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Uses qx.bom.request.Script to sequentially load a list of URIs.
 */

qx.Class.define("inspector.selenium.QueuedScriptLoader", {

  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);
    this.__queue = [];
  },

  events :
  {
    /**
     * Fired after the queue was processed. Data is a map with the fields
     * "success" and "fail" (the amount of succesfully/unsuccessfully loaded
     * URIs)
     */
    "finished" : "qx.event.type.Data"
  },

  members :
  {

    __queue : null,
    __results : null,

    /**
     * Sequentially loads all URIs from the given list.
     *
     * @param uriList {Array} List of script resources to be loaded
     */
    load : function(uriList)
    {
      this.__queue = this.__queue.concat(uriList);
      this.__results = {
        "success" : 0,
        "fail" : 0
      };
      this.__flushQueue();
    },

    /**
     * Processes the next entry in the URI queue. Fires the "finished" event
     * once the queue is empty.
     */
    __flushQueue : function()
    {
      if (this.__queue.length == 0) {
        this.fireDataEvent("finished", this.__results);
        return;
      }

      var uri = this.__queue.shift();

      var loader = new qx.bom.request.Script();
      loader.on("load", this.__onScriptLoad, this);
      loader.on("error", this.__onScriptError, this);
      loader.on("timeout", this.__onScriptError, this);
      loader.open("GET", uri);
      loader.send();
    },


    /**
     * Callback function for the script request's "load" event
     * @param request {qx.bom.request.Script} Script request object
     */
    __onScriptLoad : function(request)
    {
      if (request.status < 400) {
        this.__results.success++;
      }
      this.__flushQueue();
    },


    /**
     * Callback function for the script request's "error" event
     * @param request {qx.bom.request.Script} Script request object
     */
    __onScriptError : function(request)
    {
      this.__results.fail++;
      this.__flushQueue();
    }
  }
});
