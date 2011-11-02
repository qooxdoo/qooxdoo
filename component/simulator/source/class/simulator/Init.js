/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Modified qx.core.Init for server-side applications where no browser events
 * are available.
 */
qx.Class.define("simulator.Init",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Returns the instantiated qooxdoo application.
     *
     * @return {qx.core.Object} The application instance.
     */
    getApplication : function() {
      return this.__application || null;
    },


    /**
     * Runs when the application is loaded. Automatically creates an instance
     * of the class defined by the setting <code>qx.application</code>.
     *
     * @return {void}
     */
    ready : function()
    {
      if (this.__application) {
        return;
      }

      qx.log.Logger.debug(this, "Load runtime: " + (new Date - qx.Bootstrap.LOADSTART) + "ms");

      var app = qx.core.Environment.get("qx.application");
      var clazz = qx.Class.getByName(app);

      if (clazz)
      {
        this.__application = new clazz;

        var start = new Date;
        this.__application.main();
        qx.log.Logger.debug(this, "Main runtime: " + (new Date - start) + "ms");

        var start = new Date;
        this.__application.finalize();
        qx.log.Logger.debug(this, "Finalize runtime: " + (new Date - start) + "ms");
      }
      else
      {
        qx.log.Logger.warn("Missing application class: " + app);
      }
    }
  }
});
