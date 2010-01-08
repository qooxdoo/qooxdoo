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

/**
 * Container for the source code editor.
 *
 * This is implemented as a separate class, for instance to easily change the
 * z-index of the iframe blocker.
 */
qx.Class.define("playground.view.EditorContainer",
{
  extend : qx.ui.container.Composite,
  include : qx.ui.core.MBlocker,


  /**
   * sets the z-index of the blocker to 100 to allow sliding of the playground.
   */
  construct : function()
  {
    this.base(arguments);

    // If widgets are added to the container, the zIndex of the editor blocker
    // is set to 100. This makes possible to resize the splitpanes
    this.addListener("addChildWidget", function()
    {
      this.getBlocker().getContentBlockerElement().setStyles({ "zIndex" : 100 });
      this.getBlocker().getBlockerElement().setStyles({ "zIndex" : 100 });
    });

    var layout = new qx.ui.layout.VBox();
    layout.setSeparator("separator-vertical");
    this.setLayout(layout);
    this.set({ decorator : "main" });
  }
});