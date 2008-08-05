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
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Event dispatcher for all bubbling events on legacy widgets.
 */
qx.Class.define("qx.legacy.event.WidgetBubbling",
{
  extend : qx.event.dispatch.AbstractBubbling,




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this dispatcher */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCHER HELPER
    ---------------------------------------------------------------------------
    */

    // overridden
    _getParent : function(target) {
      return target.getParent();
    },




    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCHER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canDispatchEvent : function(target, event, type) {
      return target instanceof qx.legacy.ui.core.Widget && event.getBubbles();
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    qx.event.Registration.addDispatcher(statics);
  }
});
