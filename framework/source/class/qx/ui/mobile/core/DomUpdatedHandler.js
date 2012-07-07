/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * This class provides the <code>domupdated</code> event. The event is
 * delegated to all widget instances that have a
 * listener for the <code>domupdated</code> event registered.
 *
 * @internal
 */
qx.Class.define("qx.ui.mobile.core.DomUpdatedHandler",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,


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
    qx.ui.mobile.core.DomUpdatedHandler.__instances[this.$$hash] = this;
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL,


    /** {Map} Supported event types */
    SUPPORTED_TYPES :
    {
      domupdated : 1
    },


    /** {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : false,


    /** {Map} Stores all domUpdated manager instances */
    __instances : {},


    /**
     * Informs all handlers. Useful after massive DOM manipulations e.g.
     * through {@link qx.ui.mobile.core.Widget}.
     *
     * @return {void}
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
    canHandleEvent : function(target, type) {
      return target instanceof qx.ui.mobile.core.Widget;
    },


    // interface implementation
    registerEvent : function(target, type, capture)
    {
      var hash = target.$$hash;
      var targets = this.__targets;

      if (targets && !targets[hash])
      {
        targets[hash] = target;
      }
    },


    // interface implementation
    unregisterEvent : function(target, type, capture)
    {
      var hash = target.$$hash;
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
     * This method is called by all DOM tree modifying routines
     * to inform the widgets.
     *
     * @return {void}
     */
    refresh : function()
    {
      var targets = this.__targets;
      var target;
      for (var hash in targets)
      {
        target = targets[hash];
        if (target && !target.$$disposed && target.isSeeable())
        {
          var evt = qx.event.Registration.createEvent("domupdated");
          this.__manager.dispatchEvent(target, evt);
        }
      }
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
    delete qx.ui.mobile.core.DomUpdatedHandler.__instances[this.$$hash];
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
