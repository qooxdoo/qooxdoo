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
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * This class supports <code>appear</code> and <code>disappear</code> events
 * on DOM level.
 */
qx.Class.define("qx.event.handler.Appear",
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
    qx.event.handler.Appear.__instances[this.$$hash] = this;
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
      appear : true,
      disappear : true
    },


    /** {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_DOMNODE,


    /** {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : true,


    /** {Map} Stores all appear manager instances */
    __instances : {},


    /**
     * Refreshes all appear handlers. Useful after massive DOM manipulations e.g.
     * through qx.html.Element.
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
      var hash = qx.core.ObjectRegistry.toHashCode(target);
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
      var hash = qx.core.ObjectRegistry.toHashCode(target);
      var targets = this.__targets;
      if (!targets) {
        return;
      }

      if (targets[hash])
      {
        delete targets[hash];
        target.$$displayed = null;
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
     * @return {void}
     */
    refresh : function()
    {
      var targets = this.__targets;
      var elem;

      for (var hash in targets)
      {
        elem = targets[hash];

        var displayed = elem.offsetWidth > 0;
        if ((!!elem.$$displayed) !== displayed)
        {
          elem.$$displayed = displayed;

          var evt = qx.event.Registration.createEvent(displayed ? "appear" : "disappear");
          this.__manager.dispatchEvent(elem, evt);
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
    this._disposeFields("__manager", "__targets");

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
