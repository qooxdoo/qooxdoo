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

************************************************************************ */

/* ************************************************************************

#require(qx.event.handler.Application)
#require(qx.event.dispatch.Direct)

************************************************************************ */

/**
 * This is the base class for all qooxdoo applications.
 */
qx.Class.define("qx.core.Init",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Returns the instanciated qooxdoo application.
     *
     * @type static
     * @return {qx.core.Object} The application instance.
     */
    getApplication : function() {
      return this.__application || null;
    },


    /**
     * Runs when the application is loaded. Automatically creates an instance
     * of the class defined by the setting <code>qx.application</code>.
     *
     * @type static
     * @return {void}
     */
    __ready : function()
    {
      qx.log.Logger.debug(this, "Loaded application in " + (new Date - qx.Bootstrap.LOADSTART) + "ms");

      var app = qx.core.Setting.get("qx.application");
      var clazz = qx.Class.getByName(app);

      if (clazz)
      {
        var start = new Date;

        this.__application = new clazz;
        this.__application.main();

        qx.log.Logger.debug(this, "Executed main() in " + (new Date - start) + "ms");
      }
    },


    /**
     * Runs when the document is unloaded. Automatically terminates a previously
     * created application instance.
     *
     * @type static
     * @return {void}
     */
    __shutdown : function()
    {
      var app = this.__application;

      if (app) {
        app.terminate();
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
    qx.event.Registration.addListener(window, "ready", statics.__ready, statics);
    qx.event.Registration.addListener(window, "shutdown", statics.__shutdown, statics);
  }
});
