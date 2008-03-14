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
 * A header for a standard table
 */
qx.Class.define("qx.ui.progressive.headfoot.TableHeading",
{
  extend     : qx.ui.progressive.headfoot.Abstract,

  construct : function(columnWidths, labelArr)
  {
    this.base(arguments);

    this.setHeight(16);

    var border = new qx.ui.core.Border(1, "solid", "#eeeeee");
    border.setWidthTop(0);
    border.setWidthLeft(0);
    border.setWidthBottom(2);
    border.setColorBottom("#aaaaaa");
    
    var label;

    // For each label...
    for (var i = 0; i < labelArr.length; i++)
    {
      // ... create an atom to hold the label
      label = new qx.ui.basic.Atom(labelArr[i]);

      // Use the width of the corresponding column
      label.setWidth(columnWidths[i].getWidth());

      // Set borders for the headings
      label.setBorder(border);

      // Add the label to this heading.
      this.add(label);
    }
  }
});
