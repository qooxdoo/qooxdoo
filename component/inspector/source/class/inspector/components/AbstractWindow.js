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
 * Abstract window.
 */
qx.Class.define("inspector.components.AbstractWindow",
{
  extend : qx.ui.window.Window,

  /**
   * Creates a new instance of a AbstractWindow.
   *
   * @param name {String} The window title.
   * @param inspectorModel {inspector.components.IInspectorModel} model to show.
   */
  construct : function(name, inspectorModel)
  {
    this.base(arguments, name);

    this._model = inspectorModel;

    this.setLayout(new qx.ui.layout.Canvas());

    // apply default size and position
    this.syncAppearance();
    this.setInitSizeAndPosition();
  },

  events :
  {
    /** Fired when the window is opend. */
    "open" : "qx.event.type.Event"
  },

  properties :
  {
    appearance :
    {
      init: "inspector-window",
      refine : true
    }
  },

  members :
  {
    /** {inspector.components.IInspectorModel} model to show */
    _model : null,

    /**
     * Init the size and the position from the window.
     */
    setInitSizeAndPosition : function() {
      throw new Error("Abstract method call (setInitSizeAndPosition) in 'AbstractWindow'!");
    },

    /**
     * Sets the window to the passed position/size.
     *
     * @param position {Map} with <code>Integer</code> values for left, top, width, height as key.
     */
    setSizeAndPosition : function(position) {
      if (!isNaN(position.left) && !isNaN(position.top)) {
        this.moveTo(position.left, position.top);
      }

      if (!isNaN(position.width) && !isNaN(position.height))
      {
        this.setWidth(position.width);
        this.setHeight(position.height);
      }
    },

    // overridden
    open : function()
    {
      this.base(arguments);
      this.fireEvent("open");
    }
  },

  destruct : function() {
    this._disposeObjects("_model");
  }
});
