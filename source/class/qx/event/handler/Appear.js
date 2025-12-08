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

************************************************************************ */

/**
 * This class supports <code>appear</code> and <code>disappear</code> events
 * on DOM level.
 *
 * NOTE: Instances of this class must be disposed of after use
 *
 */
qx.Class.define("qx.event.handler.Appear", {
  extend: qx.core.Object,
  implement: [qx.event.IEventHandler, qx.core.IDisposable],

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

    this.__manager = manager;
    this.__targets = {};

    // Register
    qx.event.handler.Appear.__instances[this.toHashCode()] = this;
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
      appear: true,
      disappear: true
    },

    /** @type {Integer} Which target check to use */
    TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE,

    /** @type {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE: true,

    /** @type {Map} Stores all appear manager instances */
    __instances: {},

    /**
     * Refreshes all appear handlers. Useful after massive DOM manipulations e.g.
     * through qx.html.Element.
     *
     */
    refresh() {
      var all = this.__instances;
      for (var hash in all) {
        all[hash].refresh();
      }
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    __manager: null,
    __targets: null,

    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent(target, type) {},

    // interface implementation
    registerEvent(target, type, capture) {
      var hash = qx.core.ObjectRegistry.toHashCode(target) + type;
      var targets = this.__targets;

      if (targets && !targets[hash]) {
        targets[hash] = target;
        target.$$displayed = target.offsetWidth > 0;
      }
    },

    // interface implementation
    unregisterEvent(target, type, capture) {
      var hash = qx.core.ObjectRegistry.toHashCode(target) + type;
      var targets = this.__targets;
      if (!targets) {
        return;
      }

      if (targets[hash]) {
        delete targets[hash];
      }
    },

    /*
    ---------------------------------------------------------------------------
      USER ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * This method should be called by all DOM tree modifying routines
     * to check the registered nodes for changes.
     *
     * @return {qx.Promise?} a promise, if one or more of the event handlers returned one
     */
    refresh() {
      var targets = this.__targets;
      var elem;
      let promise = null;

      var legacyIe =
        qx.core.Environment.get("engine.name") == "mshtml" &&
        qx.core.Environment.get("browser.documentmode") < 9;

      for (var hash in targets) {
        elem = targets[hash];

        var displayed = elem.offsetWidth > 0;
        if (!displayed && legacyIe) {
          // force recalculation in IE 8. See bug #7872
          displayed = elem.offsetWidth > 0;
        }
        if (!!elem.$$displayed !== displayed) {
          elem.$$displayed = displayed;

          var evt = qx.event.Registration.createEvent(
            displayed ? "appear" : "disappear"
          );
          let tmp = this.__manager.dispatchEvent(elem, evt);
          promise = qx.event.Utils.queuePromise(promise, tmp);
        }
      }

      return promise;
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct() {
    this.__manager = this.__targets = null;

    // Deregister
    delete qx.event.handler.Appear.__instances[this.toHashCode()];
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
