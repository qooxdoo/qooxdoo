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
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 */
qx.Class.define("qx.ui.mobile.page.Page",
{
  extend : qx.ui.mobile.container.Composite,


 /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(layout)
  {
    this.base(arguments, layout);
    if (!layout) {
      this.setLayout(new qx.ui.mobile.layout.VBox());
    }
    qx.ui.mobile.page.Page.getManager().add(this);
    this._resize();
    qx.event.Registration.addListener(window, "orientationchange", this._resize, this);
    // TODO: only add this event for desktop browsers
    qx.event.Registration.addListener(window, "resize", this._resize, this);
  },




 /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    "initialize" : "qx.event.type.Event",
    "start" : "qx.event.type.Event",
    "stop" : "qx.event.type.Event",
    "pause" : "qx.event.type.Event",
    "resume" : "qx.event.type.Event",
    "back" : "qx.event.type.Event",
    "menu" : "qx.event.type.Event"
  },




 /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    defaultCssClass :
    {
      refine : true,
      init : "page"
    }
  },




 /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    __manager : null,
    __managerClass : null,


    getManager : function()
    {
      if (!this.__manager) {
        this.__manager = new this.__managerClass();
      }
      return this.__manager;
    },


    /**
     * @param clazz {Class}
     */
    setManagerClass : function(clazz)
    {
      this.__managerClass = clazz;
    }
  },




 /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __initialized : false,


    _resize : function()
    {
      if (qx.core.Environment.get("qx.mobile.nativescroll"))
      {
        this._setStyle("minHeight", window.innerHeight + "px");
      } else {
        this._setStyle("height", window.innerHeight + "px");
      }
    },


    // overridden
    _applyId : function(value, old)
    {
      this.base(arguments, value, old);
      if (old != null) {
        qx.ui.mobile.page.Page.getManager().remove(old);
      }

      qx.ui.mobile.page.Page.getManager().add(this);
    },


    /**
     * Abstract method.
     */
    back : function()
    {
      this.fireEvent("back", true)
      return false;
    },


    /**
     * Abstract method.
     */
    menu : function() {
      this.fireEvent("menu");
    },


    /*
    ---------------------------------------------------------------------------
      Lifecycle Methods
    ---------------------------------------------------------------------------
    */

    initialize : function()
    {
      if (!this.isInitialized())
      {
        this._initialize();
        this.__initialized = true;
        this.fireEvent("initialize");
      }
    },


    /**
     * Abstract method.
     */
    _initialize : function()
    {

    },


    isInitialized : function()
    {
      return this.__initialized;
    },


    start : function() {
      this._start();
      this.fireEvent("start");
    },


    /**
     * Abstract method.
     */
    _start : function()
    {

    },


    stop : function()
    {
      this._stop();
      this.fireEvent("stop");
    },


     /**
     * Abstract method.
     */
    _stop : function()
    {

    },


    pause : function() {
      this._pause();
      this.fireEvent("pause");
    },


    /**
     * Abstract method.
     */
    _pause : function()
    {

    },


    resume : function() {
      this._resume();
      this.fireEvent("resume");
    },


    /**
     * Abstract method.
     */
    _resume : function()
    {

    },


    show : function(data)
    {
      qx.ui.mobile.page.Page.getManager().show(this, data);
    }
  },




 /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    qx.event.Registration.removeListener(window, "orientationchange", this._resize, this);
    // TODO: only add this event for desktop browsers
    qx.event.Registration.removeListener(window, "resize", this._resize, this);
    this.__initialized = null;
    if (!qx.core.ObjectRegistry.inShutDown)
    {
      if (this.getId()) {
        qx.ui.mobile.page.Page.getManager().remove(this.getId());
      }
    }
  },




 /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    if (qx.core.Environment.get("css.translate3d")) {
      statics.setManagerClass(qx.ui.mobile.page.manager.Animation);
    } else {
      statics.setManagerClass(qx.ui.mobile.page.manager.Simple);
    }
  }
});
