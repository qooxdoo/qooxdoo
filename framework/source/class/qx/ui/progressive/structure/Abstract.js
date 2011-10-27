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

/**
 * Abstract structure definition for Progressive
 */
qx.Class.define("qx.ui.progressive.structure.Abstract",
{
  type       : "abstract",
  extend     : qx.core.Object,

  /**
   * The abstract structure for use by Progressive.  It defines the pane
   * container in which items are progressively rendered.
   *
   * @param pane {qx.ui.core.Widget|null}
   *   The container to use as the pane, applied to the Progressive
   *   structure.  If null, a qx.ui.core.Widget will be instantiated for
   *   use as the pane.
   */
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
     * Apply the structure typically defined in the constructor to the
     * Progressive.
     *
     * @param progressive {qx.ui.progressive.Progressive}
     *   The Progressive to which the structure is to be applied.
     */
    applyStructure : function(progressive)
    {
      throw new Error("applyStructure() is abstract");
    },


    /**
     * Get the pane in which this Progressive renders.
     *
     * @return {qx.ui.core.Widget}
     */
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

    this.__container = this.__pane = null;
  }
});
