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
    this.base(arguments);

    // If no pane was specified. Create one.
    if (! pane)
    {
      this.__container = new qx.ui.core.Widget();
      this.__pane = this.__container;
    }
    else
    {
      this.__container = null;
      this.__pane = pane;
    }

    this.__pane.getContentElement().setStyle("overflowY", "auto");
  },

  members :
  {

    __container : null,
    __pane : null,

    /**
     */
    applyStructure : function(progressive)
    {
      throw new Error("applyStructure() is abstract");
    },

    getPane : function()
    {
      return this.__pane;
    }
  },

  destruct : function()
  {
    if (this.__container)
    {
      this.__container.dispose();
    }

    this._disposeFields(
      "__container",
      "__pane");
  }
});
