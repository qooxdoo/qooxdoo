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

#require(qx.core.Init)

************************************************************************ */

/**
 * Abstract base class for GUI applications using qooxdoo widgets.
 */
qx.Class.define("qx.application.AbstractGui",
{
  type : "abstract",
  extend : qx.core.Object,
  implement : [qx.application.IApplication],
  include : qx.locale.MTranslation,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /** {qx.ui.core.Widget} The root widget */
    __root : null,


    /**
     * Create the root widget. This method is abstract and must be overridden
     * by sub classes.
     *
     * @return {qx.ui.core.Widget} The root widget. This widget must be configured
     *     with a {@link qx.ui.layout.Basic} or {@link qx.ui.layout.Canvas} layout.
     */
    _createRootWidget : function() {
      throw new Error("Abstract method call");
    },


    /**
     * Returns the application's root widget. The root widgets can act as container
     * for popups. It is configured with a {@link qx.ui.layout.Basic} (if the
     * application is an inline application) layout or a {@link qx.ui.layout.Canvas}
     * (if the application is a standalone application) layout .
     *
     * The root has the same add method as the configured layout
     * ({@link qx.ui.layout.Basic} or {@link qx.ui.layout.Canvas}).
     *
     * @return {qx.ui.core.Widget} The application's root widget.
     */
    getRoot : function() {
      return this.__root;
    },


    // interface method
    main : function()
    {
      // Initialize themes
      qx.theme.manager.Meta.getInstance().initialize();

      // Initialize tooltip manager
      qx.ui.tooltip.Manager.getInstance();

      this.__root = this._createRootWidget();
    },


    // interface method
    finalize : function() {
      this.render();
    },


    /**
     * Updates the GUI rendering
     *
     */
    render : function() {
      qx.ui.core.queue.Manager.flush();
    },


    // interface method
    close : function(val)
    {
      // empty
    },


    // interface method
    terminate : function()
    {
      // empty
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__root = null;
  }
});
