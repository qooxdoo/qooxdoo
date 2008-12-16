/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Yuecel Beser (ybeser)

************************************************************************ */

/* ************************************************************************



************************************************************************ */

qx.Class.define("playground.EditorContainer",
{
  extend : qx.ui.container.Composite,
  include : qx.ui.core.MBlocker,


  /**
   * The container of the editor.
   * This class disjoint to a separate class to change the z-index of the blocker 
   */
  construct : function()
  {
    this.base(arguments);

    // if widgets added to the container, the zIndex of the editor-Blocker
    // sets to 100. This makes possible to slide the panes in the playground
    this.addListener("addChildWidget", function()
    {
      this._getContentBlocker().setStyles({ "zIndex" : 100 });
      this._getBlocker().setStyles({ "zIndex" : 100 });
    });

    this.setLayout(new qx.ui.layout.VBox());
    this.set({ decorator : "main" });
  }
});