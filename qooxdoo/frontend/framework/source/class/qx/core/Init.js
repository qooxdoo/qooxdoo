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

#module(core)
#optional(qx.Theme)
#optional(qx.locale.Manager)
#optional(qx.bom.client.Engine)
#optional(qx.bom.client.Platform)
#optional(qx.bom.client.System)
#optional(qx.bom.client.Flash)

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

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        this.debug("qooxdoo " + qx.core.Version.toString());

        this.debug("loaded " + qx.Class.getTotalNumber() + " classes");
        this.debug("loaded " + qx.Interface.getTotalNumber() + " interfaces");
        this.debug("loaded " + qx.Mixin.getTotalNumber() + " mixins");

        if (qx.Theme) {
          this.debug("loaded " + qx.Theme.getTotalNumber() + " themes");
        }

        if (qx.locale && qx.locale.Manager) {
          this.debug("loaded " + qx.locale.Manager.getInstance().getAvailableLocales().length + " locales");
        }

        // Print browser information
        if (qx.bom && qx.bom.client)
        {
          if (qx.bom.client.Engine) {
            this.debug("engine: " + qx.bom.client.Engine.NAME + "-" + qx.bom.client.Engine.FULLVERSION);
          }

          if (qx.bom.client.Platform && qx.bom.client.System) {
            this.debug("system: " + qx.bom.client.Platform.NAME + " | " + qx.bom.client.System.NAME);
          }

          if (qx.bom.client.Flash)
          {
            var express = qx.bom.client.Flash.EXPRESSINSTALL ? " (express)" : " (no-express)";
            this.debug("flash: " + qx.bom.client.Flash.FULLVERSION + express);
          }
        }
      }

      // Init application from settings
      if (!this.getApplication())
      {
        var clazz = qx.Class.getByName(qx.core.Setting.get("qx.application"));
        if (clazz) {
          this.setApplication(new clazz(this));
        }
      }

      if (!this.getApplication()) {
        return;
      }

      // Debug info
      this.debug("application: " + this.getApplication().classname + "[" + this.getApplication().toHashCode() + "]");

      // Send onload
      var start = new Date;

      this.getApplication().main();

      this.info("main runtime: " + (new Date - start) + "ms");
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

  defer : function(statics, proto, properties)
  {
    // Force direct creation
    statics.getInstance();
  }
});
