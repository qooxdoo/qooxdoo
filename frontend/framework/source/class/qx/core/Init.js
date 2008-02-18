/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#optional(qx.bom.client.Engine)
#optional(qx.bom.client.Platform)
#optional(qx.bom.client.System)

#require(qx.event.Registration)
#require(qx.event.handler.Window)
#require(qx.event.dispatch.Direct)

************************************************************************ */

/**
 * Initialize qooxdoo based application.
 *
 * Attaches qooxdoo callbacks to the browser load events (onload, onunload, onbeforeunload)
 * and initializes the application. The initializations starts automatically.
 *
 * Make sure you set the application to your application before the load event is fired:
 * <pre class='javascript'>qx.core.Init.getInstance().setApplication(new YourApplication)</pre>. This can
 * also be defined using the setting <code>qx.application</code>.
 */
qx.Class.define("qx.core.Init",
{
  type : "singleton",
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Attach DOM events
    qx.event.Registration.addListener(window, "load", this._onload, this);
    qx.event.Registration.addListener(window, "beforeunload", this._onbeforeunload, this);
    qx.event.Registration.addListener(window, "unload", this._onunload, this);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Fired in the load event of the document window and before the main init
     * function is called
     */
    "load" : "qx.event.type.Event",

    /**
     * Fired in the beforeunload event of the document window and before the default
     * handler is called.
     */
    "beforeunload" : "qx.event.type.Event",

    /**
     * Fired in the unload event of the document window and before the default
     * handler is called.
     */
    "unload" : "qx.event.type.Event"
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Reference to the constructor of the main application.
     *
     * Set this before the onload event is fired.
     */
    application :
    {
      nullable : true,
      check : function(value)
      {
        if (typeof value == "function") {
          throw new Error(
          "The application property takes an application instance as parameter " +
          "and no longer a class/constructor. You may have to fix your 'index.html'.");
        }
        return value && qx.Class.hasInterface(value.constructor, qx.application.IApplication);
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
    _autoDispose : false,


    /**
     * load event handler
     *
     * @type member
     * @param e {Event} event
     * @return {var} TODOC
     */
    _onload : function(e)
    {
      this.LOADED = true;

      this.fireEvent("load");

      // Init application from settings
      if (!this.getApplication())
      {
        var clazz = qx.Class.getByName(qx.core.Setting.get("qx.application"));
        if (clazz) {
          this.setApplication(new clazz(this));
        }
      }

      var app = this.getApplication();
      if (!app) {
        return;
      }

      // Start main method
      var start = new Date();
      app.debug("Running main()...");
      app.main();
      app.debug("Done in: " + (new Date-start) + "ms");
    },


    /**
     * beforeunload event handler
     *
     * @type member
     * @param e {Event} event
     * @return {var} TODOC
     */
    _onbeforeunload : function(e)
    {
      this.fireEvent("beforeunload");

      if (this.getApplication())
      {
        // Send onbeforeunload event (can be cancelled)
        var result = this.getApplication().close();
        if (result != null) {
          e.returnValue = result;
        }
      }
    },


    /**
     * unload event handler
     *
     * @type member
     * @param e {Event} event
     * @return {void}
     */
    _onunload : function(e)
    {
      this.fireEvent("unload");

      if (this.getApplication())
      {
        // Send onunload event (last event)
        this.getApplication().terminate();
      }

      // Dispose all qooxdoo objects
      qx.core.Object.dispose(true);
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings :
  {
    "qx.application" : "qx.application.Gui"
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // Detach DOM events
    qx.event.Registration.removeListener(window, "load", this._onload, this);
    qx.event.Registration.removeListener(window, "beforeunload", this._onbeforeunload, this);
    qx.event.Registration.removeListener(window, "unload", this._onunload, this);
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members, properties)
  {
    // Force direct creation
    statics.getInstance();
  }
});
