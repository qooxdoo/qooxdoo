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
 * <pre>qx.core.Init.getInstance().setApplication(new YourApplication)</pre>. This can
 * also be defined using the setting <code>qx.initApplication</code>.
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
      check : "qx.application.IApplication"
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
        var clazz = qx.Class.getByName(qx.core.Setting.get("qx.initApplication"));
        this.setApplication(new clazz(this));
      }

      // Debug info
      this.debug("application: " + this.getApplication().classname);

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
      // Send onbeforeunload event (can be cancelled)
      var result = this.getApplication().close();
      if (result != null) {
        e.returnValue = result;
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
      // Send onunload event (last event)
      this.getApplication().terminate();

      // Dispose all qooxdoo objects
      qx.core.Object.dispose();
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : {
    "qx.initApplication" : "qx.application.Gui"
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
