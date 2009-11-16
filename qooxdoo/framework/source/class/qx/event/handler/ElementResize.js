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

************************************************************************ */

/**
 * This handler fires a <code>resize</code> event if the size of a DOM element
 * changes.
 */
qx.Class.define("qx.event.handler.ElementResize",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    this.base(arguments);

    this.__manager = manager;
    this.__elements = {};

    this.__timer = new qx.event.Timer(200);
    this.__timer.addListener("interval", this._onInterval, this);
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
      resize : true
    },


    /** {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_DOMNODE,


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
    __elements : null,
    __manager : null,
    __timer : null,


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent : function(target, type) {
      return target.tagName.toLowerCase() !== "body";
    },


    // interface implementation
    registerEvent : function(target, type, capture)
    {
      var hash = qx.core.ObjectRegistry.toHashCode(target);

      var elements = this.__elements;
      if (!elements[hash])
      {
        elements[hash] = {
          element: target,
          width: qx.bom.element.Dimension.getWidth(target),
          height: qx.bom.element.Dimension.getHeight(target)
        };
        this.__timer.start();
      }
    },


    // interface implementation
    unregisterEvent : function(target, type, capture)
    {
      var hash = qx.core.ObjectRegistry.toHashCode(target);

      var elements = this.__elements;
      if (elements[hash])
      {
        delete elements[hash];

        if (qx.lang.Object.isEmpty(elements)) {
          this.__timer.stop();
        }
      }
    },


    /**
     * Checks elements for width and height changes and fires resize event
     * if needed.
     *
     * @param e {qx.event.type.Data} The incoming data event
     */
    _onInterval : function(e)
    {
      var elements = this.__elements;
      for (var key in elements)
      {
        var data = elements[key];

        var el = data.element;
        var width = qx.bom.element.Dimension.getWidth(el);
        var height = qx.bom.element.Dimension.getHeight(el);

        if (data.height !== height || data.width !== width)
        {
          qx.event.Registration.fireNonBubblingEvent(
            el,
            "resize",
            qx.event.type.Data,
            [{
              width: width,
              oldWidth: data.width,
              height: height,
              oldHeight: data.height
            }]
          );

          data.width = width;
          data.height = height;
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
    this.__manager = this.__elements = null;
    this._disposeObjects("__timer");
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
