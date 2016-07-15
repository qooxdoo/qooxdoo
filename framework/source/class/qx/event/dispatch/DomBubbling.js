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
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Event dispatcher for all bubbling events on DOM elements.
 */
qx.Class.define("qx.event.dispatch.DomBubbling",
{
  extend : qx.event.dispatch.AbstractBubbling,


  statics :
  {
    /** @type {Integer} Priority of this dispatcher */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL
  },


  members :
  {
    // overridden
    _getParent : function(target) {
      return target.parentNode;
    },


    // interface implementation
    canDispatchEvent : function(target, event, type) {
      return target.nodeType !== undefined && event.getBubbles();
    }
  },


  defer : function(statics) {
    qx.event.Registration.addDispatcher(statics);
  }
});
