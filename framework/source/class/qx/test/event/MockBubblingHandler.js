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

qx.Class.define("qx.test.event.MockBubblingHandler",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,

  statics :
  {
    /** @type {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_LAST
  },

  members :
  {
    // interface implementation
    canHandleEvent : function(target, type) {
      return target.nodeType !== undefined;
    },


    // interface implementation
    registerEvent : function(target, type, capture) {},


    // interface implementation
    unregisterEvent : function(target, type, capture) {}
  },

  defer : function(statics) {
    qx.event.Registration.addHandler(statics);
  }
});
