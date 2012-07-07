/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * A group widget arranges several widgets visual.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var title = new qx.ui.mobile.form.Title("Group");
 *   var group = new qx.ui.mobile.form.Group();
 *   var list = new qx.ui.mobile.list.List();
 *   group.add(list);
 *
 *   this.getRoot.add(title);
 *   this.getRoot.add(group);
 * </pre>
 *
 * This example creates a group and adds a list to it.
 */
qx.Class.define("qx.ui.mobile.form.Group",
{
  extend : qx.ui.mobile.container.Composite,


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "group"
    }
  }
});
