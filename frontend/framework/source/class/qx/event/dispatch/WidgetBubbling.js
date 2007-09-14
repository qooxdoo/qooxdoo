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
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(event)

************************************************************************ */

/**
 * Event dispatcher for all bubbling events on DOM elements.
 */
qx.Class.define("qx.event.dispatch.WidgetBubbling",
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
    PRIORITY : qx.event.Manager.PRIORITY_NORMAL
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
      return target instanceof qx.ui.core.Widget && event.getBubbles();
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