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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
/**
 * <code>AbstractView</code> for a inspector window. The view is a <code>VBox</code>
 * which containing a <code>ToolBar</code> on top.
 */
qx.Class.define("inspector.components.AbstractView",
{
  extend : qx.ui.container.Composite,

  construct : function()
  {
    this.base(arguments);

    this.setLayout(new qx.ui.layout.VBox());

    // Creats the toolbar
    this._toolbar = new qx.ui.toolbar.ToolBar();
    this._toolbar._getLayout().setAlignY("middle");
    this.add(this._toolbar);
  },

  members :
  {
    /** {qx.ui.toolbar.ToolBar} tool bar instance */
    _toolbar : null
  },

  destruct : function()
  {
    this._toolbar.dispose();
    this._toolbar = null;
  }
});
