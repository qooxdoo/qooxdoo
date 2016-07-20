/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.event.dispatch.TestingWindow",
{
  extend : qx.core.Object,

  events :
  {
    "unload" : "qx.event.type.Event",
    "onunload" : "qx.event.type.Event"
  },


  members :
  {
    addEventListener : function(type, callback, capture) {
      return this.addListener(type, callback, this, capture);
    },

    attachEvent : function(type, callback) {
      return this.addListener(type, callback);
    }
  }
});
