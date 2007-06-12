/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

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
#require(qx.html.EventRegistration)

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
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Attach DOM events
    qx.html.EventRegistration.addEventListener(window, "load", qx.lang.Function.bind(this._onload, this));
    qx.html.EventRegistration.addEventListener(window, "beforeunload", qx.lang.Function.bind(this._onbeforeunload, this));
    qx.html.EventRegistration.addEventListener(window, "unload", qx.lang.Function.bind(this._onunload, this));
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
      this.createDispatchEvent("load");

      this.debug("qooxdoo " + qx.core.Version.toString());

      // Print out class information
      if (qx.core.Variant.isSet("qx.compatibility", "on")) {
        this.debug("loaded " + qx.lang.Object.getLength(qx.OO.classes) + " old classes");
      }

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
      var cl = qx.core.Client.getInstance();
      this.debug("client: " + cl.getEngine() + "-" + cl.getMajor() + "." + cl.getMinor() + "/" + cl.getPlatform() + "/" + cl.getLocale());
      this.debug("browser: " + cl.getBrowser() + "/" + (cl.supportsSvg() ? "svg" : cl.supportsVml() ? "vml" : "none"));

      // Box model warning
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Variant.isSet("qx.client", "mshtml"))
        {
          if (!cl.isInQuirksMode()) {
            this.warn("Wrong box sizing: Please modify the document's DOCTYPE!");
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
      this.debug("application: " + this.getApplication().classname);

      // Send onload
      var start = new Date;

      // This is a common migration error for 0.7
      // this code may be removed once the main qooxdoo user base
      // has migrated to 0.7
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        var app = this.getApplication();

        if (app.initialize)
        {
          this.warn(
            "The 'initialize' method is no longer called automatically! Please call it manually " +
            "from the end of the constructor or the start of the 'main' method."
          );
        }

        if (app.finalize)
        {
          this.warn(
            "The 'finalize' method is no longer called automatically! It is save to call it at the " +
            "end of the 'main' method."
          );
        }

        var msg = "The overridden 'main' method has to be called. Please add " +
            "the following command at beginning of your 'main' method: " +
            "'this.base(arguments)'. The same is true over overridden " +
            "'terminate' and 'close' methods."
        var exception;

        try {
          app.main();
        } catch(ex) {
          exception = ex;
        }

        if (!app._initializedMain)
        {
          if (exception) {
            this.error(msg)
          } else {
            throw new Error(msg);
          }
        }

        if (exception) {
          throw exception;
        }
      }
      else
      {
        this.getApplication().main();
      }

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
      this.createDispatchEvent("beforeunload");

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
      this.createDispatchEvent("unload");

      if (this.getApplication())
      {
        // Send onunload event (last event)
        this.getApplication().terminate();
      }

      // Dispose all qooxdoo objects
      qx.core.Object.dispose();
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings :
  {
    "qx.application" : "qx.application.Gui",
    "qx.isSource" : true
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
