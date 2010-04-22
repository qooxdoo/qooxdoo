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
 * Abstract window that contains a empty toolbar.
 */
qx.Class.define("inspector.components.AbstractWindow",
{
  extend : qx.ui.window.Window,

  /**
   * Creates a new instance of a AbstractWindow.
   *
   * @param name {String} The window title.
   */
  construct : function(name)
  {
    this.base(arguments, name);

    // Set layout
    this.setLayout(new qx.ui.layout.VBox());
    this.setWidth(300);
    this.setHeight(200);
    this.setContentPadding(0);

    // Disaple buttons
    this.setShowMinimize(false);
    this.setShowMaximize(false);

    // Create toolbar
    this._toolbar = new qx.ui.toolbar.ToolBar();
    this._toolbar.setPaddingLeft(3);
    this._toolbar.setPaddingRight(3);
    this._toolbar._getLayout().setAlignY("middle");
    this.add(this._toolbar);
  },

  members :
  {
    /**
     * Toolbar instance.
     */
    _toolbar : null,

    /**
     * Window instance from the Iframe.
     */
    _iFrameWindow : null,

    /**
     * Init the size and the position from the window.
     */
    setInitSizeAndPosition : function() {
      // throw an exception if the method is called on the abstract class
      throw new Error("Abstract method call (setInitSizeAndPosition) in 'AbstractWindow'!");
    }
  },

  destruct : function() {
    this._disposeObjects("_toolbar");
  }
});
