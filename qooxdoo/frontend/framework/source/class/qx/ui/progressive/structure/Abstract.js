/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_progressive)

************************************************************************ */

/**
 * Structure definition for Progressive
 */
qx.Class.define("qx.ui.progressive.structure.Abstract",
{
  type       : "abstract",
  extend     : qx.core.Object,

  construct : function(pane)
  {
    // If no pane was specified, use a vertical box layout
    if (! pane)
    {
      this.__vBoxLayout = new qx.ui.layout.VerticalBoxLayout();
      this._pane = this.__vBoxLayout;
    }
    else
    {
      this.__vBoxLayout = null;
      this._pane = pane;
    }
    this._pane.setHeight("1*");
    this._pane.setOverflow("auto");
  },

  members :
  {
    /**
     */
    applyStructure : function(progressive)
    {
      throw new Error("applyStructure() is abstract");
    },

    getPane : function()
    {
      return this._pane;
    }
  },

  destruct : function()
  {
    if (this.__vBoxLayout)
    {
      this.__vBoxLayout.dispose();
      this.__vBoxLayout = null;
    }

    this._pane = null;
  }
});
