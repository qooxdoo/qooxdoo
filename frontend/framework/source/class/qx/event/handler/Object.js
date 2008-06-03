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
 * This class provides qooxdoo object event support.
 */
qx.Class.define("qx.event.handler.Object",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_LAST,

    /** {Map} Supported event types */
    SUPPORTED_TYPES : null,

    /** {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_OBJECT,

    /** {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : false
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
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent : function(target, type) {
      return qx.Class.supportsEvent(target.constructor, type);
    },


    // interface implementation
    registerEvent : function(target, type, capture) {
      // Nothing needs to be done here
    },


    // interface implementation
    unregisterEvent : function(target, type, capture) {
      // Nothing needs to be done here
    }
  },






  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    qx.event.Registration.addHandler(statics);
  }
});
