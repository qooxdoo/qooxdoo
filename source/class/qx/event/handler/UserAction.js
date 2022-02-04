/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This handler accepts the useraction event fired by the keyboard, mouse and
 * pointer handlers after an user triggered action has occurred.
 */
qx.Class.define("qx.event.handler.UserAction", {
  extend: qx.core.Object,
  implement: qx.event.IEventHandler,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Create a new instance
   *
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct(manager) {
    super();

    // Define shorthands
    this.__manager = manager;
    this.__window = manager.getWindow();
  },

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics: {
    /** @type {Integer} Priority of this handler */
    PRIORITY: qx.event.Registration.PRIORITY_NORMAL,

    /** @type {Map} Supported event types */
    SUPPORTED_TYPES: {
      useraction: 1
    },

    /** @type {Integer} Which target check to use */
    TARGET_CHECK: qx.event.IEventHandler.TARGET_WINDOW,

    /** @type {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE: true
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    __manager: null,
    __window: null,

    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent(target, type) {},

    // interface implementation
    registerEvent(target, type, capture) {
      // Nothing needs to be done here
    },

    // interface implementation
    unregisterEvent(target, type, capture) {
      // Nothing needs to be done here
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct() {
    this.__manager = this.__window = null;
  },

  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer(statics) {
    qx.event.Registration.addHandler(statics);
  }
});
