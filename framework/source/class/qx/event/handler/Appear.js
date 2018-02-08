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
qx.Class.define("qx.event.handler.Appear",
{
  extend : qx.core.Object,
  implement : [ qx.event.IEventHandler, qx.core.IDisposable ],




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
  construct : function(manager)
  {
    this.base(arguments);

    this.__manager = manager;
    this.__targets = {};

    // Register
    qx.event.handler.Appear.__instances[this.$$hash] = this;
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** @type {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL,


    /** @type {Map} Supported event types */
    SUPPORTED_TYPES :
    {
      appear : true,
      disappear : true
    },


    /** @type {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_DOMNODE,


    /** @type {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : true,


    /** @type {Map} Stores all appear manager instances */
    __instances : {},


    /**
     * Refreshes all appear handlers. Useful after massive DOM manipulations e.g.
     * through qx.html.Element.
     *
     */
     refresh : function()
     {
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

  members :
  {
    __manager : null,
    __targets : null,

    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent : function(target, type) {},


    // interface implementation
    registerEvent : function(target, type, capture)
    {
      var hash = qx.core.ObjectRegistry.toHashCode(target) + type;
      var targets = this.__targets;

      if (targets && !targets[hash])
      {
        targets[hash] = target;
        target.$$displayed = target.offsetWidth > 0;
      }
    },


    // interface implementation
    unregisterEvent : function(target, type, capture)
    {
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
    refresh : function()
    {
      var targets = this.__targets;

      var legacyIe = qx.core.Environment.get("engine.name") == "mshtml" &&
        qx.core.Environment.get("browser.documentmode") < 9;

      var tracker = {};
      var self = this;
      Object.keys(targets).forEach(function(hash) {
        var elem = targets[hash];
        if (elem === undefined) {
          return;
        }

        qx.event.Utils.then(tracker, function() {
          var displayed = elem.offsetWidth > 0;
          if (!displayed && legacyIe) {
            // force recalculation in IE 8. See bug #7872
            displayed = elem.offsetWidth > 0;
          }
          if ((!!elem.$$displayed) !== displayed)
          {
            elem.$$displayed = displayed;

            var evt = qx.event.Registration.createEvent(displayed ? "appear" : "disappear");
            return self.__manager.dispatchEvent(elem, evt);
          }
        });
      });
      return tracker.promise;
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.__manager = this.__targets = null;

    // Deregister
    delete qx.event.handler.Appear.__instances[this.$$hash];
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
