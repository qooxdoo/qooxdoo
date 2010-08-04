/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Objects window which shows all registered qooxdoo objects.
 */
qx.Class.define("inspector.objects.Window",
{
  extend : qx.ui.window.Window,

  /**
   * Construct window.
   *
   * @param name {String} window title.
   * @param inspectorModel {inspector.components.IInspectorModel} model to show.
   */
  construct : function(name, inspectorModel)
  {
    this.base(arguments, name);

    this.setLayout(new qx.ui.layout.Canvas());

    this.setAppearance("objectsWindow");
    this.syncAppearance();

    // apply default size and position
    this.setInitSizeAndPosition();

    this.__model = new inspector.objects.Model(inspectorModel)
    this.__controller = new inspector.objects.Controller(this.__model);
    this.add(this.__controller.getView(), {edge: 0});
  },

  events :
  {
    /** Fired when the window is opend. */
    "open" : "qx.event.type.Event"
  },

  members :
  {
    /** {inspector.components.IInspectorModel} model to show */
    __model : null,

    /** {inspector.objects.Controller} controller for the view. */
    __controller : null,

    /**
     * Sets the window to the passed position/size.
     *
     * @param position {Map} with <code>Integer</code> values for left, top, width, height as key.
     */
    setSizeAndPosition : function(position) {
      this.moveTo(position.left, position.top);
      this.setWidth(position.width);
      this.setHeight(position.height);
    },

    /**
     * Sets the window to a default position/size.
     */
    setInitSizeAndPosition : function() {
      var left = parseInt(qx.bom.Viewport.getWidth() - this.getWidth());
      var height = parseInt((qx.bom.Viewport.getHeight() - 30) / 3);
      this.moveTo(left, 30);
      this.setHeight(height);
    },

    // overridden
    open : function()
    {
      this.base(arguments);
      this.fireEvent("open");
    }
  },

  destruct : function() {
    this._disposeObjects("__model", "__controller");
  }
});
