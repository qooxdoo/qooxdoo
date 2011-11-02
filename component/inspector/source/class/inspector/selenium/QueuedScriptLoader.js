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
 * Uses qx.io.ScriptLoader to sequentially load a list of URIs.
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
      this.__flushQueue("init");
    },

    /**
     * Processes the current URI queue. Fires the "finished" event once the
     * queue is empty.
     *
     * @param status {String} Current processing status
     */
    __flushQueue : function(status)
    {
      switch(status)
      {
        case "init":
          this.__results = {
            "success" : 0,
            "fail" : 0
          };
          break;

        case "success":
          this.__results.success++;
          break;

        case "fail":
          this.__results.fail++;
          break;
      }
      if (this.__queue.length == 0) {
        this.fireDataEvent("finished", this.__results);
        return;
      }
      var uri = this.__queue.shift();
      var loader = new qx.io.ScriptLoader();
      loader.load(uri, this.__flushQueue, this);
    }
  }
});
