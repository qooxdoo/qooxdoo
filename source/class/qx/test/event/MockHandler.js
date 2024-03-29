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

/**
 * This class provides qooxdoo object event support.
 */
qx.Class.define("qx.test.event.MockHandler", {
  extend: qx.core.Object,
  implement: qx.event.IEventHandler,

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics: {
    /** @type {Integer} Priority of this handler */
    PRIORITY: qx.event.Registration.PRIORITY_FIRST,

    /** @type {Map} Supported event types */
    SUPPORTED_TYPES: null,

    /** @type {Integer} Which target check to use */
    TARGET_CHECK: qx.event.IEventHandler.TARGET_OBJECT,

    /** @type {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE: false
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  /* eslint-disable @qooxdoo/qx/no-refs-in-members */
  members: {
    calls: [],

    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent(target, type) {
      this.calls.push(["canHandleEvent", target, type]);
      return type.startsWith("$test");
    },

    // interface implementation
    registerEvent(target, type, capture) {
      this.calls.push(["registerEvent", target, type, capture]);
    },

    // interface implementation
    unregisterEvent(target, type, capture) {
      this.calls.push(["unregisterEvent", target, type, capture]);
    }
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
